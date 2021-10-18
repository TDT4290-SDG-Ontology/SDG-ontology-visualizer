export type Goal = {
  kpi: string;
  baseline: number;
  baselineYear: number;
  target: number;
  deadline: number;
  startRange: number;
  dataseries: ?string;
  calculationMethod: string;
};

export type Dataseries = {
  kpi: string;
  year: number;
  value: number;
  dataseries: ?string;
  calculationMethod: string;
};

export type GDCGoal = {
  indicatorId: string;
  indicatorName: string;
  municipality: string;

  baseline: number;
  baselineYear: number;
  target: number;
  deadline: number;
  startRange: number;

  isDummy: boolean;
  dataseries: ?string;
};

export type Datapoint = {
  year: number;
  value: number;
};

export type YearlyGrowth = {
  value: number;
  startYear: number;
  endYear: number;
};

export type IndicatorScore = {
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

  historicalData: Datapoint[];
  yearlyGrowth: YearlyGrowth[];

  goal: Goal;

  // Mean and standard deviation (with bessel correction) of the difference
  // between the predicted value and the actual measured value.
  diffMean: number;
  diffStd: number;

  // Mean and standard deviation of trends
  trendMean: number;
  trendStd: number;
};

export type IndicatorWithoutGoal = {
  kpi: string;
  dataseries: string | null;

  currentCAGR: number;

  historicalData: Datapoint[];
  yearlyGrowth: YearlyGrowth[];

  trendMean: number;
  trendStd: number;

  calculationMethod: string;
};

export type CumulativeScore = {
  cumulative: number;
  average: number;
  count: number;
  projectedCompletion: number;
};

export type Score = {
  score: number;
  projectedCompletion: number;
};

export type GDCOutput = {
  averageScore: number;
  projectedCompletion: number;

  domains: Map<string, Score>;
  subdomains: Map<string, Score>;
  categories: Map<string, Score>;
  indicators: Map<string, IndicatorScore>;

  indicatorsWithoutGoals: Map<string, IndicatorWithoutGoal>;
  unreportedIndicators: string[];
};
