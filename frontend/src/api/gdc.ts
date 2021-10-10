import api from './api';
import { IndicatorScore, IndicatorWithoutGoal, Score, GDCOutput } from '../types/gdcTypes';

export const getGDCOutput = async (municipality: string, year: number): Promise<GDCOutput> => {
  try {
    return await api.POST('gdc/get', { municipality, year }).then((data) => {
      try {
        const domains: Map<string, Score> = new Map<string, Score>(data.domains);
        const subdomains: Map<string, Score> = new Map<string, Score>(data.subdomains);
        const categories: Map<string, Score> = new Map<string, Score>(data.categories);
        const indicators: Map<string, IndicatorScore> = new Map<string, IndicatorScore>(
          data.indicators,
        );

        const indicatorsWithoutGoals: Map<string, IndicatorWithoutGoal> = new Map<
          string,
          IndicatorWithoutGoal
        >(data.indicatorsWithoutGoals);

        const output: GDCOutput = {
          municipality: data.municipality,
          year: data.year,

          averageScore: data.averageScore,
          projectedCompletion: data.projectedCompletion,

          domains,
          subdomains,
          categories,
          indicators,

          indicatorsWithoutGoals,

          unreportedIndicators: data.unreportedIndicators,
        };

        return output;
      } catch (e) {
        console.log(e);
        return {
          municipality,
          year,

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
    });
  } catch (e) {
    console.log(e);
    return {
      municipality,
      year,

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

export const getCorrelatedKPIs = (kpi: string) => kpi;
