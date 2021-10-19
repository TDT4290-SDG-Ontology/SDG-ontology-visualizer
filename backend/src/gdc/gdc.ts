import * as fs from 'fs/promises';
import computeScore from './score';

import {
  u4sscKpiToCategory,
  u4sscCategoryToSubdomain,
  u4sscSubdomainToDomain,
  u4sscKpis,
} from '../database/u4sscKpiMap';

import { ApiError } from '../types/errorTypes';

import {
  Goal,
  Dataseries,
  GDCOutput,
  IndicatorWithoutGoal,
  YearlyGrowth,
  CumulativeScore,
  Score,
  IndicatorScore,
} from '../types/gdcTypes';

import { gdc2json } from '../utils/gdcUtils';

export const computeGDC = (
  dataseries: Dataseries[],
  goalArray: Goal[],
  historicalData: Dataseries[],
): GDCOutput => {
  const goals: Map<string, Goal> = new Map<string, Goal>();

  goalArray.forEach((goal) => {
    const isVariant = goal.dataseries !== undefined;
    const displayKPI = goal.kpi + (isVariant ? ` - ${goal.dataseries}` : '');
    goals.set(displayKPI, goal);
  });

  const outputIndicatorScores = new Map<string, IndicatorScore>();
  const outputCategoryScores = new Map<string, Score>();
  const outputSubdomainScores = new Map<string, Score>();
  const outputDomainScores = new Map<string, Score>();

  const indicatorsWithoutGoals = new Map<string, IndicatorWithoutGoal>();
  const unreportedIndicators = new Set(u4sscKpis);

  const categoryScores = new Map<string, IndicatorScore[]>();
  const subdomainScores = new Map<string, CumulativeScore[]>();
  const domainScores = new Map<string, CumulativeScore[]>();

  dataseries.forEach((series) => {
    const isVariant = series.dataseries !== undefined;
    const displayKPI = series.kpi + (isVariant ? ` - ${series.dataseries}` : '');

    const goal = goals.get(displayKPI);
    unreportedIndicators.delete(series.kpi);

    if (goal === undefined) {
      indicatorsWithoutGoals.set(displayKPI, {
        kpi: series.kpi,
        dataseries: series.dataseries,
        historicalData: [],
        yearlyGrowth: [],
        currentCAGR: 0.0,
        trendMean: 0.0,
        trendStd: 0.0,
        calculationMethod: series.calculationMethod,
      });

      return;
    }

    const score = computeScore(series.kpi, series, goal);

    outputIndicatorScores.set(displayKPI, score);

    const category = u4sscKpiToCategory.get(series.kpi);
    if (category === undefined) throw new ApiError(400, 'WUT');

    const arr = categoryScores.get(category);
    if (arr === undefined) categoryScores.set(category, [score]);
    else if (series.dataseries !== undefined) arr.push(score);
  });

  // aggregate historical data

  historicalData.forEach((hist) => {
    const isVariant = hist.dataseries !== undefined;
    const displayKPI = hist.kpi + (isVariant ? ` - ${hist.dataseries}` : '');

    let score: IndicatorScore | IndicatorWithoutGoal | undefined = outputIndicatorScores.get(
      displayKPI,
    );
    if (score === undefined) {
      // Did not get score from indicators with goals, try the ones without goals instead...
      score = indicatorsWithoutGoals.get(displayKPI);

      if (score === undefined) return;
    }

    score.historicalData.push({ year: hist.year, value: hist.value });
  });

  // calculate statistical data
  // Need to use a for-of loop as we're assigning to the properties of the iterator variable
  /* eslint-disable-next-line no-restricted-syntax */
  for (const score of outputIndicatorScores.values()) {
    // Compute mean and std-dev of difference from predicted values.
    const { baseline, baselineYear } = score.goal;

    // Ensure sorted historical data. We depend on this in the frontend...
    score.historicalData.sort((a, b) => a.year - b.year);

    const predictionDiffs: number[] = score.historicalData.map((datum) => {
      const predictedValue = baseline * (score.currentCAGR + 1.0) ** (datum.year - baselineYear);
      return datum.value - predictedValue;
    });

    const diffMean = predictionDiffs.reduce((acc, val) => acc + val) / predictionDiffs.length;
    const squaredDiff = predictionDiffs.reduce(
      (acc, val) => acc + (val - diffMean) * (val - diffMean),
      0.0,
    );
    const diffStd =
      predictionDiffs.length > 1 ? Math.sqrt(squaredDiff / (predictionDiffs.length - 1)) : 0;

    score.diffMean = diffMean;
    score.diffStd = diffStd;

    // Find periods of largest and smallest growth.

    // compute CAGR between the different years
    const yearlyGrowth: YearlyGrowth[] = [];
    for (let i = 1; i < score.historicalData.length; i += 1) {
      const prev = score.historicalData[i - 1];
      const curr = score.historicalData[i];
      const CAGR = (curr.value / prev.value) ** (1 / (curr.year - prev.year)) - 1.0;
      yearlyGrowth.push({ value: CAGR, startYear: prev.year, endYear: curr.year });
    }

    if (yearlyGrowth.length > 0) {
      const trends = yearlyGrowth.map((g) => g.value);
      const trendMean = trends.reduce((acc, v) => acc + v) / yearlyGrowth.length;
      const squaredDiffTrend = trends.reduce(
        (acc, v) => acc + (v - trendMean) * (v - trendMean),
        0.0,
      );
      const trendStd = trends.length > 1 ? Math.sqrt(squaredDiffTrend / (trends.length - 1)) : 0.0;

      score.trendMean = trendMean;
      score.trendStd = trendStd;
    }

    if (score.goal.calculationMethod.startsWith('INV_'))
      yearlyGrowth.sort((a, b) => b.value - a.value);
    else yearlyGrowth.sort((a, b) => a.value - b.value);

    score.yearlyGrowth = yearlyGrowth;
  }

  // Calculate stats for indicators without goals
  // Need to use a for-of loop as we're assigning to the properties of the iterator variable
  /* eslint-disable-next-line no-restricted-syntax */
  for (const score of indicatorsWithoutGoals.values()) {
    score.historicalData.sort((a, b) => a.year - b.year);

    const first = score.historicalData[0];
    const current = score.historicalData[score.historicalData.length - 1];
    if (current.year !== first.year)
      score.currentCAGR =
        (current.value / first.value) ** (1.0 / (current.year - first.year)) - 1.0;

    // Find periods of largest and smallest growth.

    // compute CAGR between the different years
    const yearlyGrowth: YearlyGrowth[] = [];
    for (let i = 1; i < score.historicalData.length; i += 1) {
      const prev = score.historicalData[i - 1];
      const curr = score.historicalData[i];
      const CAGR = (curr.value / prev.value) ** (1 / (curr.year - prev.year)) - 1.0;
      yearlyGrowth.push({ value: CAGR, startYear: prev.year, endYear: curr.year });
    }

    if (yearlyGrowth.length > 0) {
      const trends = yearlyGrowth.map((g) => g.value);
      const trendMean = trends.reduce((acc, v) => acc + v) / yearlyGrowth.length;
      const squaredDiffTrend = trends.reduce(
        (acc, v) => acc + (v - trendMean) * (v - trendMean),
        0.0,
      );
      const trendStd = trends.length > 1 ? Math.sqrt(squaredDiffTrend / (trends.length - 1)) : 0.0;

      score.trendMean = trendMean;
      score.trendStd = trendStd;
    }

    if (score.calculationMethod.startsWith('INV_')) yearlyGrowth.sort((a, b) => b.value - a.value);
    else yearlyGrowth.sort((a, b) => a.value - b.value);

    score.yearlyGrowth = yearlyGrowth;
  }

  // NOTE: we store the cumulative points and number of indicators in order to avoid problems with using
  // the average of averages.

  // The following is just computing the hierarcical scores. Should probably be extracted into a helper function, but eh...

  // Compute category score (average of indicators)
  categoryScores.forEach((scores: IndicatorScore[], category: string) => {
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
  });

  // Compute subdomain scores
  subdomainScores.forEach((scores: CumulativeScore[], subdomain: string) => {
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
  });

  let projectedCompletion = -Infinity;
  let cumulativeScore = 0;
  let numberOfPosts = 0;

  // Compute domain scores
  domainScores.forEach((scores: CumulativeScore[], domain: string) => {
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
  });

  const averageScore = cumulativeScore / Math.max(numberOfPosts, 1);

  return {
    averageScore,
    projectedCompletion,
    domains: outputDomainScores,
    subdomains: outputSubdomainScores,
    categories: outputCategoryScores,
    indicators: outputIndicatorScores,
    indicatorsWithoutGoals,
    unreportedIndicators: Array.from(unreportedIndicators),
  };
};

export const recordGDCData = async (
  municipality: string,
  year: number,
  goalOverride: string,
  dataseries: Dataseries[],
  goals: Goal[],
  historicalData: Dataseries[],
  output: GDCOutput,
) => {
  const filename = `./src/tests/gdcData/${municipality}-${year}-${goalOverride}.ts`;
  let filehandle;
  try {
    // await fs.unlink(filename);
    filehandle = await fs.open(filename, 'w');
    await filehandle.write("import { Dataseries, Goal, GDCOutput } from '../../types/gdcTypes';\n");
    await filehandle.write("import { json2gdc } from '../../utils/gdcUtils';\n\n");

    await filehandle.write(`export const municipality: string = "${municipality}";\n`);
    await filehandle.write(`export const goalOverride: string = "${goalOverride}";\n`);
    await filehandle.write(`export const year: number = ${year};\n\n`);

    await filehandle.write(
      `export const dataseries: Dataseries[] = JSON.parse('${JSON.stringify(dataseries)}');\n`,
    );
    await filehandle.write(
      `export const goals: Goal[] = JSON.parse('${JSON.stringify(goals)}');\n`,
    );
    await filehandle.write(
      `export const historicalData: Dataseries[] = JSON.parse('${JSON.stringify(
        historicalData,
      )}');\n\n`,
    );

    await filehandle.write(
      `export const gdcOutput: GDCOutput = json2gdc(JSON.parse('${JSON.stringify(
        gdc2json(output),
      )}'));\n`,
    );
  } catch (err) {
    console.error(err);
  } finally {
    await filehandle?.close();
  }
};
