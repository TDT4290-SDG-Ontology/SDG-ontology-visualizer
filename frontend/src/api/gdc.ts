import api, { API_BASE, responseHandler } from './api';
import {
  IndicatorScore,
  IndicatorWithoutGoal,
  Score,
  GDCOutput,
  CorrelatedKPI,
} from '../types/gdcTypes';

export const getGDCOutput = async (
  municipality: string,
  year: number,
  goalOverride?: string,
  overrideMode?: string,
): Promise<GDCOutput> => {
  try {
    const reqBody =
      goalOverride !== undefined
        ? { municipality, year, goalOverride, overrideMode }
        : { municipality, year };
    return await api.POST('gdc/get', reqBody).then((data) => {
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

export const getCorrelatedKPIs = async (kpi: string): Promise<CorrelatedKPI[]> => {
  try {
    const data: CorrelatedKPI[] = await api.GET(`gdc/correlated-kpis/${kpi}`);
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const uploadGoalCSV = async (token: string, formData: FormData): Promise<boolean> => {
  try {
    // Have to do this in order to send form data...
    // TODO: refactor into helper function in api.ts
    return await window
      .fetch(`${API_BASE}/gdc/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      .then(responseHandler)
      .then(() => true)
      .catch(() => false);
  } catch (e) {
    console.log(e);
    return false;
  }
};
