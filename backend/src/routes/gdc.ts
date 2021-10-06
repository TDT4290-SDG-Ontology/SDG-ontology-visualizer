/* eslint-disable no-nested-ternary */

import { Router, Request, Response } from 'express';

import getGDCDataSeries from '../database/getGDCDataSeries';
import getGDCGoals from '../database/getGDCGoals';
import setGDCGoal from '../database/setGDCGoal';
import deleteGDCGoal from '../database/deleteGDCGoal';
import getCorrelatedKPIs from '../database/getCorrelatedKPIs';

import { Goal, Dataseries } from '../types/gdcTypes';

import {
  u4sscKpiToCategory,
  u4sscCategoryToSubdomain,
  u4sscSubdomainToDomain,
  u4sscKpis,
  u4sscKpiMap,
} from '../database/u4sscKpiMap';
import { ApiError } from '../types/errorTypes';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';
import verifyToken from './middleware/verifyToken';

const router = Router();

type IndicatorScore = {
  kpi: string;
  dataseries: string | null;
  score: number;
  points: number;

  // estimated year of completion
  projectedCompletion: number;

  // CAGR -- Compound Annual Growth Rate
  // is the rate of return that is required for an investment to grow from its
  // starting balance to its ending balance, assuming profits were reinvested
  // each period of the lifespan of the investment. A classic use for this is
  // to see how much the investment grows after n periods.
  //
  // The way its used here is basically to calculate the achieved "interest",
  // which is then used to extrapolate the current trajectory, allowing us to
  // estimate future values, check if we're ahead of the required trajectory,
  // see how we can modulate the efforts required to reach the target within
  // the set deadline, and estimate the year of completion.
  //
  // One major advantage of using this measure is that it's smooth, as we're
  // computing the measures based on one data point and the goal parameters.
  currentCAGR: number;
  requiredCAGR: number;
  targetCAGR: number;

  willCompleteBeforeDeadline: boolean;
};

const computeScore = (kpi: string, current: Dataseries, goal: Goal): IndicatorScore => {
  const CMP_EPSILON = 0.0001; // TODO: tune the epsilon
  const absGoalBaselineDiff = Math.abs(goal.target - goal.baseline);
  if (absGoalBaselineDiff < CMP_EPSILON) {
    // Goal equal to baseline -- assume it's fulfilled.
    // TODO: Check if assumption holds.
    return {
      kpi,
      dataseries: current.dataseries,
      score: 4,
      points: 100,
      projectedCompletion: goal.baselineYear,
      willCompleteBeforeDeadline: true,
      currentCAGR: 0.0,
      requiredCAGR: 0.0,
      targetCAGR: 0.0,
    };
  }

  if (Math.abs(goal.target - current.value) < 0.01) {
    // current value equal enough to target -- assume it's fulfilled.
    return {
      kpi,
      dataseries: current.dataseries,
      score: 4,
      points: 100,
      projectedCompletion: current.year,
      willCompleteBeforeDeadline: true,
      currentCAGR: 0.0,
      requiredCAGR: 0.0,
      targetCAGR: 0.0,
    };
  }

  // Normalise value to make comparisons easier, scaled such that a value of 100 represents
  // reaching the target.
  //
  // We need to distinguish score calculation based on data series, which is done through the 'dataseriesCalculationMethod' data property.
  // This is needed due to the score being based on indicators being "within x% of target".
  // There are a few cases here:
  //  1. "Increasing" targets where higher and increasing values are wanted, eg. voter participation. This calculation is simple,
  //      but assumes the worst possible measurement being 0.
  //
  //        indicatorScore = 100.0 * (current.value / goal.target);
  //
  //  2. "Decreasing" targets where lower and decreasing values are wanted, eg. violent crime rate. For this calculation we need the
  //      start range in order to calculate "within x%". The start range is the worst possible measurement, which is given a score of 0.
  //
  //        indicatorScore = 100.0 * (current.value - goal.startRange) / (goal.target - goal.startRange);
  //
  //  The latter calculation is applicable in both cases, but requires more information to be set by the users.

  // TODO: handle case where goal.target == goal.startRange
  const indicatorScore =
    (100.0 * (current.value - goal.startRange)) / (goal.target - goal.startRange);

  // U4SSC indicator points for score:
  //  95+: 4
  //  [66, 95): 3
  //  [33, 66): 2
  //  [ 0, 33): 1 (I'm a bit unsure if this bottoms out at 0.0 or if it encompasses all scores below...)

  // prettier-ignore
  const points =
        indicatorScore >= 95.0 ? 4 : 
          indicatorScore >= 66.0 ? 3 : 
            indicatorScore >= 33.0 ? 2 : 
              indicatorScore >=  0.0 ? 1 : 0;

  const baselineComp = Math.max(goal.baseline, 0.1); // Guard against division by 0. TODO: check for better solutions for this.
  const targetFraction = goal.target / baselineComp;
  const currentFraction = current.value / baselineComp;

  const currentCAGR = currentFraction ** (1.0 / (current.year - goal.baselineYear)) - 1.0;
  const requiredCAGR =
    (goal.target / current.value) ** (1.0 / (goal.deadline - current.year)) - 1.0;
  const targetCAGR = targetFraction ** (1.0 / (goal.deadline - goal.baselineYear)) - 1.0;

  const fractCompare = Math.abs(currentFraction);
  if (
    fractCompare <= 1.0 + CMP_EPSILON ||
    indicatorScore <= 0.0 ||
    goal.calculationMethod === 'BOOL'
  ) {
    // One of:
    //  1.  Current value is baseline (either no progress, or values have returned to baseline).
    //      This needs better modeling in order to handle, outside the scope of this project, TODO for later projects!
    //
    //  2.  Values have regressed from baseline, projection will never reach goal, return inf.
    //      This requires better modeling, as CAGR based projections will indicate completion dates before
    //      the datapoint was measured.
    //      NOTE: this requires separate handling in order to support the inverse calculations (DONE!)
    //
    // We don't support completion estimation for BOOL values, as we don't have enough data to do this.

    // Handle non-INV_... calculation predictions by giving up, as the model year-calculation doesn't really
    // support this, and will result in predictions of completion year before the baseline year, which doesn't
    // make any sense...
    if (!goal.calculationMethod.startsWith('INV_')) {
      return {
        kpi,
        dataseries: current.dataseries,
        score: indicatorScore,
        points,
        projectedCompletion: -1,
        willCompleteBeforeDeadline: false,
        currentCAGR,
        requiredCAGR,
        targetCAGR,
      };
    }
  }

  // This value is projected based on an assumption of compounding annual growth rate, which is used
  // by the UN in order to evaluate trends in the dataset. This assumption might not hold (esp. for developed countries),
  // as the old adage goes: the first 90% takes 90% of the time, and the last 10% also take 90% of the time.
  //
  // There should be an investigation into whether or not a logistics function might model this better wrt.
  // long completion tails.

  // Derivation of projected completion year:
  //
  //  baseline * (current.value / goal.baseline) ** ((end_year - goal.baselineYear) / (current.year - goal.baselineYear)) = target
  //
  //  (current.value / goal.baseline) ** ((end_year - goal.baselineYear) / (current.year - goal.baselineYear)) = target / baseline
  //
  //  log(current.value / goal.baseline) * (end_year - goal.baselineYear) / (current.year - goal.baselineYear) = log(target / baseline)
  //
  //  (end_year - goal.baselineYear) = (current.year - goal.baselineYear) * log(target / baseline) / log(current.value / goal.baseline)
  //
  //  end_year = goal.baselineYear + (current.year - goal.baselineYear) * log(target / baseline) / log(current.value / goal.baseline)

  const projectedCompletion =
    goal.baselineYear +
    (indicatorScore >= 100
      ? current.year - goal.baselineYear
      : (current.year - goal.baselineYear) *
        (Math.log(targetFraction) / Math.log(currentFraction)));

  // TODO: consider if we should round the projected completion year to the nearest integer (or upwards).

  const willComplete = projectedCompletion < goal.deadline;

  return {
    kpi,
    dataseries: current.dataseries,
    score: indicatorScore,
    points,
    projectedCompletion,
    willCompleteBeforeDeadline: willComplete,
    currentCAGR,
    requiredCAGR,
    targetCAGR,
  };
};

type CumulativeScore = {
  cumulative: number;
  average: number;
  count: number;
  projectedCompletion: number;
};

type Score = {
  score: number;
  projectedCompletion: number;
};

const getGoalDistance = async (req: Request, res: Response) => {
  try {
    const dataseriesPromise = getGDCDataSeries(req.body.municipality, req.body.year);
    const goalsPromise = getGDCGoals(req.body.municipality);

    // It should be more efficient to wait on both promises at the same time.
    const data = await Promise.all([dataseriesPromise, goalsPromise]);
    const dataseries: Dataseries[] = data[0];
    const goalArray: Goal[] = data[1];

    const goals: Map<string, Goal> = new Map<string, Goal>();

    /* eslint-disable-next-line no-restricted-syntax */
    for (const goal of goalArray.values()) {
      const isVariant = goal.dataseries !== undefined;
      const displayKPI = goal.kpi + (isVariant ? ` - ${goal.dataseries}` : '');
      goals.set(displayKPI, goal);
    }

    const outputIndicatorScores = new Map<string, IndicatorScore>();
    const outputCategoryScores = new Map<string, Score>();
    const outputSubdomainScores = new Map<string, Score>();
    const outputDomainScores = new Map<string, Score>();

    const indicatorsWithoutGoals: string[] = [];
    const unreportedIndicators = new Set(u4sscKpis);

    const categoryScores = new Map<string, IndicatorScore[]>();
    const subdomainScores = new Map<string, CumulativeScore[]>();
    const domainScores = new Map<string, CumulativeScore[]>();

    /* eslint-disable-next-line no-restricted-syntax */
    for (const series of dataseries.values()) {
      const isVariant = series.dataseries !== undefined;
      const displayKPI = series.kpi + (isVariant ? ` - ${series.dataseries}` : '');

      const goal = goals.get(displayKPI);
      unreportedIndicators.delete(series.kpi);

      if (goal === undefined) {
        indicatorsWithoutGoals.push(series.kpi);

        /* eslint-disable-next-line no-continue */
        continue;
      }

      const score = computeScore(series.kpi, series, goal);

      outputIndicatorScores.set(displayKPI, score);

      const category = u4sscKpiToCategory.get(series.kpi);
      if (category === undefined) throw new ApiError(400, 'WUT');

      const arr = categoryScores.get(category);
      if (arr === undefined) categoryScores.set(category, [score]);
      else if (series.dataseries !== undefined) arr.push(score);
    }

    // NOTE: we store the cumulative points and number of indicators in order to avoid problems with using
    // the average of averages.

    // The following is just computing the hierarcical scores. Should probably be extracted into a helper function, but eh...

    // Compute category score (average of indicators)
    /* eslint-disable-next-line no-restricted-syntax */
    for (const [category, scores] of categoryScores) {
      const cumulativePoints = scores.map((x) => x.points).reduce((acc, score) => acc + score);
      const longestCompletion = scores
        .map((x) => x.projectedCompletion)
        .reduce((acc, score) => Math.max(acc, score));
      const avgPoints = cumulativePoints / scores.length;

      outputCategoryScores.set(category, {
        score: avgPoints,
        projectedCompletion: longestCompletion,
      });

      const subdomain = u4sscCategoryToSubdomain.get(category);
      if (subdomain === undefined) throw new ApiError(400, 'WUT?');

      const arr = subdomainScores.get(subdomain);
      if (arr === undefined)
        subdomainScores.set(subdomain, [
          {
            cumulative: cumulativePoints,
            average: avgPoints,
            count: scores.length,
            projectedCompletion: longestCompletion,
          },
        ]);
      else
        arr.push({
          cumulative: cumulativePoints,
          average: avgPoints,
          count: scores.length,
          projectedCompletion: longestCompletion,
        });
    }

    // Compute subdomain scores
    /* eslint-disable-next-line no-restricted-syntax */
    for (const [subdomain, scores] of subdomainScores) {
      const cumulativePoints = scores.map((x) => x.cumulative).reduce((acc, score) => acc + score);
      const longestCompletion = scores
        .map((x) => x.projectedCompletion)
        .reduce((acc, score) => Math.max(acc, score));
      const totalNumber = scores.map((x) => x.count).reduce((acc, cat) => acc + cat);
      const avgPoints = cumulativePoints / totalNumber;

      outputSubdomainScores.set(subdomain, {
        score: avgPoints,
        projectedCompletion: longestCompletion,
      });

      const domain = u4sscSubdomainToDomain.get(subdomain);
      if (domain === undefined) throw new ApiError(400, 'WUT???');

      const arr = domainScores.get(domain);
      if (arr === undefined)
        domainScores.set(domain, [
          {
            cumulative: cumulativePoints,
            average: avgPoints,
            count: totalNumber,
            projectedCompletion: longestCompletion,
          },
        ]);
      else
        arr.push({
          cumulative: cumulativePoints,
          average: avgPoints,
          count: totalNumber,
          projectedCompletion: longestCompletion,
        });
    }

    let projectedCompletion = -Infinity;
    let cumulativeScore = 0;
    let numberOfPosts = 0;

    // Compute domain scores
    /* eslint-disable-next-line no-restricted-syntax */
    for (const [domain, scores] of domainScores) {
      const cumulativePoints = scores.map((x) => x.cumulative).reduce((acc, score) => acc + score);
      const longestCompletion = scores
        .map((x) => x.projectedCompletion)
        .reduce((acc, score) => Math.max(acc, score));
      const totalNumber = scores.map((x) => x.count).reduce((acc, cat) => acc + cat);
      const avgPoints = cumulativePoints / totalNumber;

      cumulativeScore += cumulativePoints;
      numberOfPosts += totalNumber;
      projectedCompletion = Math.max(projectedCompletion, longestCompletion);

      outputDomainScores.set(domain, { score: avgPoints, projectedCompletion: longestCompletion });
    }

    const averageScore = cumulativeScore / Math.max(numberOfPosts, 1);

    res.json({
      municipality: req.body.municipality,
      year: req.body.year,

      averageScore,
      projectedCompletion,

      domains: [...outputDomainScores],
      subdomains: [...outputSubdomainScores],
      categories: [...outputCategoryScores],
      indicators: [...outputIndicatorScores],
      indicatorsWithoutGoals,
      unreportedIndicators: Array.from(unreportedIndicators),
    });
  } catch (e: any) {
    onError(e, req, res);
  }
};

const setGoal = async (req: Request, res: Response) => {
  try {
    const isDummy = req.body.isDummy !== undefined && req.body.isDummy;
    const dataseries =
      req.body.dataseries === undefined || req.body.dataseries === null
        ? 'main'
        : req.body.dataseries;

    const indicatorName = u4sscKpiMap.get(req.body.indicator);
    if (indicatorName === undefined) throw new ApiError(400, '!');

    // TODO: figure out how to do this properly, as a DELETE/INSERT query instead...
    await deleteGDCGoal(req.body.municipality, req.body.indicator, dataseries, isDummy);
    await setGDCGoal(
      req.body.municipality,
      req.body.indicator,
      indicatorName,
      dataseries,
      req.body.target,
      req.body.deadline,
      req.body.baseline,
      req.body.baselineYear,
      req.body.startRange,
      isDummy,
    );
    res.json({});
  } catch (e: any) {
    onError(e, req, res);
  }
};

const getGoals = async (req: Request, res: Response) => {
  try {
    const goalsData = await getGDCGoals(req.body.municipality);
    const goals: Map<string, Goal> = new Map<string, Goal>();

    /* eslint-disable-next-line no-restricted-syntax */
    for (const goal of goalsData.values()) {
      const isVariant = goal.dataseries !== undefined;
      const displayKPI = goal.kpi + (isVariant ? ` - ${goal.dataseries}` : '');
      goals.set(displayKPI, goal);
    }

    res.json({
      goals: [...goals],
    });
  } catch (e: any) {
    onError(e, req, res);
  }
};

const correlatedKPIs = async (req: Request, res: Response) => {
  try {
    // NOTE: we currently have correlation data for south korea and japan loaded,
    // which were the "most" developed countries we could get data for.
    // A SDG target correlation mapping for Norway should be extant, but we did not have access to it,
    // and this could be a good use case for publishing these.
    //
    // Further, as the correlations are approximated through the SDG targets, they will be somewhat
    // crude, but should be useful enough to distinguish rough categories of synergies / tradeoffs.
    // Someone might want to investigate the correlations between U4SSC KPIs in order to map this more
    // accurately.

    const resp = await getCorrelatedKPIs('kr', req.body.indicator);
    res.json(resp);
  } catch (e: any) {
    onError(e, req, res);
  }
};

router.post('/get', verifyDatabaseAccess, getGoalDistance);
router.post('/set-goal', verifyDatabaseAccess, verifyToken, setGoal);
router.post('/goals', verifyDatabaseAccess, getGoals);
router.post('/correlated-kpis', verifyDatabaseAccess, correlatedKPIs);

export default router;
