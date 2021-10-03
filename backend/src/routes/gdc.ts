import { Router, Request, Response } from 'express';

import getGDCDataSeries from '../database/getGDCDataSeries';
import getGDCGoals from '../database/getGDCGoals';
import setGDCGoal from '../database/setGDCGoal';
import deleteGDCGoal from '../database/deleteGDCGoal';

import { u4sscKpiToCategory, u4sscCategoryToSubdomain, u4sscSubdomainToDomain, u4sscKpis, u4sscKpiMap } from '../database/u4sscKpiMap';
import { ApiError } from '../types/errorTypes';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';
import verifyToken from './middleware/verifyToken';

const router = Router();

type IndicatorScore = {
  score: number;
  points: number;
  projectedCompletion: number;
  currentCAGR: number;
  requiredCAGR: number;
};

const computeScore = (current, goal) : IndicatorScore => {

  const CMP_EPSILON = 0.0001; // TODO: tune the epsilon
  const absGoalBaselineDiff = abs(goal.target - goal.baseline);
  if (absGoalBaselineDiff < CMP_EPSILON)
  {
    // Goal equal to baseline -- assume it's fulfilled.
    // TODO: Check if assumption holds.
    return {
      score: 4,
      points: 100,
      projectedCompletion: current.year,
      currentCAGR: 0.0,
      requiredCAGR: 0.0,
    };
  }

  if (abs(goal.target - current.value) < 0.01)
  {
    // goal equal enough to target -- assume it's fulfilled.
    return {
      score: 4,
      points: 100,
      projectedCompletion: current.year,
      currentCAGR: 0.0,
      requiredCAGR: 0.0,
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
  const indicatorScore = 100.0 * (current.value - goal.startRange) / (goal.target - goal.startRange);


  // U4SSC indicator points for score: 
  //  95+: 4
  //  [66, 95): 3
  //  [33, 66): 2
  //  [ 0, 33): 1 (I'm a bit unsure if this bottoms out at 0.0 or if it encompasses all scores below...)
  const points =  (indicatorScore >= 95.0) ? 4 : 
                  (indicatorScore >= 66.0) ? 3 : 
                  (indicatorScore >= 33.0) ? 2 : 
                  (indicatorScore >=  0.0) ? 1 : 0;

  const baselineComp = max(goal.baseline, 0.1); // Guard against division by 0. TODO: check for better solutions for this.
  const targetFraction = goal.target / baselineComp;
  const currentFraction = current.value / baselineComp;
  
  const currentCAGR  = pow(fractCompare, 1.0 / (current.year - goal.baselineYear)) - 1.0;
  const requiredCAGR = pow((goal.target / current.value), 1.0 / (goal.deadline - current.year)) - 1.0;

  const fractCompare = abs(currentFraction);
  if (fractCompare <== 1.0 + CMP_EPSILON || indicatorScore <== 0.0)
  {
    // One of: 
    //  1.  Current value is baseline (either no progress, or values have returned to baseline).
    //      This needs better modeling in order to handle, outside the scope of this project, TODO for later projects!
    //
    //  2.  Values have regressed from baseline, projection will never reach goal, return inf.
    //      This requires better modeling, as CAGR based projections will indicate completion dates before
    //      the datapoint was measured.

    return { 
      score,
      points
      projectedCompletion: Infinity,
      currentCAGR,
      requiredCAGR,
    };
  } 

  // This value is projected based on an assumption of compounding annual growth rate, which is used
  // by the UN in order to evaluate trends in the dataset. This assumption might not hold (esp. for developed countries),
  // as the old adage goes: the first 90% takes 90% of the time, and the last 10% also take 90% of the time.
  //
  // There should be an investigation into whether or not a logistics function might model this better wrt.
  // long completion tails.
  const projectedCompletion = goal.baselineYear + ((indicatorScore >= 100) ? (current.year - goal.baselineYear) : 
                  (current.year - goal.baselineYear) * (log(targetFraction) / log(currentFraction)));

  // TODO: consider if we should round the projected completion year to the nearest integer (or upwards).

  return {
    score,
    points,
    projectedCompletion,
    currentCAGR,
    requiredCAGR,
  };
}

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
    const dataseriesPromise = getAllDataSeries(req.body.municipality, req.body.year);
    const goalsPromise = getAllGoals(req.body.municipality);

    // It's should be more efficient to wait on both promises at the same time.
    const data = await Promise.all([dataseriesPromise, goalsPromise]);
    const dataseries = data[0];
    const goals = data[1];

    const outputIndicatorScores = new Map<string, IndicatorScore>();
    const outputCategoryScores = new Map<string, Score>();
    const outputSubdomainScores = new Map<string, Score>();
    const outputDomainScores = new Map<string, Score>();

    const indicatorsWithoutGoals = [];
    const unreportedIndicators = new Set(u4sscKpis);

    const categoryScores = new Map<string, IndicatorScore[]>();
    const subdomainScores = new Map<string, CumulativeScore[]>();
    const domainScores = new Map<string, CumulativeScore[]>();

    for (var i = 0; i < dataseries.length; i++)
    {
      const series = dataseries[i];
      const goal = goals.get(series.kpi);

      unreportedIndicators.delete(series.kpi);

      if (goal === undefined || goal === null)
      {
        outputIndicatorsWithoutGoals.push(series.kpi);
        continue;
      }

      const isVariant = series.dataseries !== undefined || series.dataseries !== null;
      const displayKPI = series.kpi + (isVariant) ? " - " + series.dataseries : "";

      const score = computeScore(series, goal);

      outputIndicatorScores.set(displayKPI, score);

      const category = u4sscKpiToCategory.get(series.kpi);
      const arr = categoryScores.get(category);
      if (arr === undefined)
        categoryScores.set(category, [ score ]);
      else if (series.dataseries !== undefined)
        arr.push(score);
    }

    // NOTE: we store the cumulative points and number of indicators in order to avoid problems with using
    // the average of averages.

    // Compute category score (average of indicators)
    for (let [category, scores] of categoryScores)
    {
      const cumulativePoints = scores.reduce((acc, score) => acc + score.points);
      const longestCompletion = scores.reduce((acc, score) => max(acc, score.projectedCompletion));
      const avgPoints = cumulativePoints / scores.length;

      outputCategoryScores.set(category, { score: avgPoints, projectedCompletion: longestCompletion });

      const subdomain = u4sscCategoryToSubdomain.get(category);
      const arr = subdomainScores.get(subdomain);
      if (arr === undefined)
        subdomainScores.set(subdomain, [ { cumulative: cumulativePoints, average: avgPoints, count: scores.length, projectedCompletion: longestCompletion } ])
      else
        arr.push({ cumulative: cumulativePoints, average: avgPoints, count: scores.length, projectedCompletion: longestCompletion });
    }

    // Compute subdomain scores
    for (let [subdomain, scores] of subdomainScores)
    {
      const cumulativePoints = scores.reduce((acc, cat) => acc + cat.cumulative);
      const longestCompletion = scores.reduce((acc, cat) => max(acc, cat.projectedCompletion));     
      const totalNumber = scores.reduce((acc, cat) => acc + cat.count);
      const avgPoints = cumulativePoints / totalNumber;

      outputSubdomainScores.set(subdomain, { score: avgPoints, projectedCompletion: longestCompletion });

      const domain = u4sscSubdomainToDomain.get(subdomain);
      const arr = domainScores.get(domain);
      if (arr === undefined)
        domainScores.set(subdomain, [ { cumulative: cumulativePoints, average: avgPoints, count: totalNumber, projectedCompletion: longestCompletion } ])
      else
        arr.push({ cumulative: cumulativePoints, average: avgPoints, count: totalNumber, projectedCompletion: longestCompletion });
    }

    var projectedCompletion = 0.0;
    var cumulativeScore = 0;
    var numberOfPosts = 0;

    // Compute domain scores
    for (let [domain, scores] of domainScores)
    {
      const cumulativePoints = scores.reduce((acc, cat) => acc + cat.cumulative);
      const longestCompletion = scores.reduce((acc, cat) => max(acc, cat.projectedCompletion));     
      const totalNumber = scores.reduce((acc, cat) => acc + cat.count);
      const avgPoints = cumulativePoints / totalNumber;

      cumulativeScore += cumulativePoints;
      numberOfPosts += totalNumber;
      projectedCompletion = max(projectedCompletion, longestCompletion);

      outputDomainScores.set(domain, { score: avgPoints, projectedCompletion: longestCompletion });
    }

    const averageScore = cumulativeScore / numberOfPosts;

    res.json({
      municipality: req.body.municipality,
      year: req.body.year,

      averageScore,
      projectedCompletion,

      domains: outputDomainScores,
      subdomains: outputSubdomainScores,
      categories: outputCategoryScores,
      indicators: outputIndicatorScores,
      indicatorsWithoutGoals,
      unreportedIndicators: Array.from(unreportedIndicators),
    });
  } catch (e: any) {
    onError(e, req, res);
  }
};

const setGoals = async (req: Request, res: Response) => {
  try {    
    const isDummy = (req.body.isDummy !== undefined) && req.body.isDummy;
    const dataseries = (req.body.dataseries === undefined || req.body.dataseries === null) ? "main" : req.body.dataseries;
    await deleteGDCGoal(req.body.municipality, req.body.kpi, dataseries, isDummy);
    await setGDCGoal(req.body.municipality, req.body.kpi, u4sscKpiMap[req.body.kpi], dataseries, req.body.target, req.body.deadline, req.body.baseline, req.body.baselineYear, req.body.startRange, isDummy);
    res.json({});
  } catch (e: any) {
    onError(e, req, res);
  }
};

const correlatedKPIs = async (req: Request, res: Response) => {
  try {
    

    res.json({});
  } catch (e: any) {
    onError(e, req, res);
  }
};

router.post('/get', verifyDatabaseAccess, getGoalDistance);
router.post('/set-goals', verifyDatabaseAccess, verifyToken, setGoals);
router.post('/correlated-kpis', verifyDatabaseAccess, correlatedKPIs);

export default router;