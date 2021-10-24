import { IndicatorScore, Dataseries, Goal } from '../types/gdcTypes';

const computeScore = (kpi: string, current: Dataseries, goal: Goal): IndicatorScore => {
  const baselineComp = Math.max(goal.baseline, 0.1); // Guard against division by 0. TODO: check for better solutions for this.
  const targetFraction = goal.target / baselineComp;
  const currentFraction = current.value / baselineComp;

  const currentCAGR = currentFraction ** (1.0 / (current.year - goal.baselineYear)) - 1.0;
  const requiredCAGR =
    (goal.target / current.value) ** (1.0 / (goal.deadline - current.year)) - 1.0;
  const targetCAGR = targetFraction ** (1.0 / (goal.deadline - goal.baselineYear)) - 1.0;

  const fractCompare = Math.abs(currentFraction);

  const CMP_EPSILON = 0.0001; // TODO: tune the epsilon
  const absGoalBaselineDiff = Math.abs(goal.target - goal.baseline);
  if (absGoalBaselineDiff < CMP_EPSILON) {
    // Goal equal to baseline -- assume it's fulfilled.
    // TODO: Check if assumption holds.
    return {
      kpi,
      dataseries: current.dataseries,
      score: 100,
      points: 4,
      projectedCompletion: goal.baselineYear,
      willCompleteBeforeDeadline: true,
      currentCAGR,
      requiredCAGR,
      targetCAGR,

      historicalData: [],
      yearlyGrowth: [],

      goal,

      diffMean: 0,
      diffStd: 0,
      trendMean: 0,
      trendStd: 0,
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

  let points: number;
  if (indicatorScore >= 95.0) points = 4;
  else if (indicatorScore >= 66.0) points = 3;
  else if (indicatorScore >= 33.0) points = 2;
  else points = 1;

  if (current.year <= goal.baselineYear) {
    return {
      kpi,
      dataseries: current.dataseries,
      points,
      score: indicatorScore,
      projectedCompletion: -1,
      willCompleteBeforeDeadline: false,
      currentCAGR,
      requiredCAGR,
      targetCAGR,

      historicalData: [],
      yearlyGrowth: [],

      goal,

      diffMean: 0,
      diffStd: 0,
      trendMean: 0,
      trendStd: 0,
    };
  }

  if (Math.abs(goal.target - current.value) < 0.01) {
    // current value equal enough to target -- assume it's fulfilled.
    return {
      kpi,
      dataseries: current.dataseries,
      score: 100,
      points: 4,
      projectedCompletion: current.year,
      willCompleteBeforeDeadline: true,
      currentCAGR,
      requiredCAGR,
      targetCAGR,

      historicalData: [],
      yearlyGrowth: [],

      goal,

      diffMean: 0,
      diffStd: 0,
      trendMean: 0,
      trendStd: 0,
    };
  }

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

        historicalData: [],
        yearlyGrowth: [],

        goal,

        diffMean: 0,
        diffStd: 0,
        trendMean: 0,
        trendStd: 0,
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

  let projectedCompletion =
    goal.baselineYear +
    (indicatorScore >= 100
      ? current.year - goal.baselineYear
      : (current.year - goal.baselineYear) *
        (Math.log(targetFraction) / Math.log(currentFraction)));

  // TODO: consider if we should round the projected completion year to the nearest integer (or upwards).

  if (projectedCompletion < current.year && indicatorScore < 99.5) {
    // Handle case where municipality does *extremely* badly, and the projected completion ends up in the past
    // even though that makes no sense...

    projectedCompletion = -1;
  }

  const willComplete =
    projectedCompletion > 0 && projectedCompletion.toFixed(2) <= goal.deadline.toFixed(2);

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

    historicalData: [],
    yearlyGrowth: [],

    goal,

    diffMean: 0,
    diffStd: 0,
    trendMean: 0,
    trendStd: 0,
  };
};

export default computeScore;
