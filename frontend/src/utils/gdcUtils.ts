import { GDCOutput, IndicatorScore, IndicatorWithoutGoal, Score } from '../types/gdcTypes';

export const gdc2json = (gdc: GDCOutput) => ({
  averageScore: gdc.averageScore,
  projectedCompletion: gdc.projectedCompletion,

  domains: [...gdc.domains],
  subdomains: [...gdc.subdomains],
  categories: [...gdc.categories],
  indicators: [...gdc.indicators],
  indicatorsWithoutGoals: [...gdc.indicatorsWithoutGoals],
  unreportedIndicators: gdc.unreportedIndicators,
});

export const json2gdc = (jsonObject: any) => {
  try {
    const domains = new Map<string, Score>(jsonObject.domains);
    const subdomains = new Map<string, Score>(jsonObject.subdomains);
    const categories = new Map<string, Score>(jsonObject.categories);
    const indicators = new Map<string, IndicatorScore>(jsonObject.indicators);

    const indicatorsWithoutGoals = new Map<string, IndicatorWithoutGoal>(
      jsonObject.indicatorsWithoutGoals,
    );

    const output: GDCOutput = {
      averageScore: jsonObject.averageScore,
      projectedCompletion: jsonObject.projectedCompletion,

      domains,
      subdomains,
      categories,
      indicators,

      indicatorsWithoutGoals,

      unreportedIndicators: jsonObject.unreportedIndicators,
    };

    return output;
  } catch (e) {
    console.log(e);
    return {
      averageScore: 0.0,
      projectedCompletion: -Infinity,

      domains: new Map<string, Score>(),
      subdomains: new Map<string, Score>(),
      categories: new Map<string, Score>(),
      indicators: new Map<string, IndicatorScore>(),

      indicatorsWithoutGoals: new Map<string, IndicatorWithoutGoal>(),
      unreportedIndicators: [],
    };
  }
};
