import DB from './index';
import setGDCGoal from './queries/setGDCGoal';

// TODO: Remove any
export default async (
  municipality: string,
  kpi: string,
  indicatorName: string,
  dataseries: string,
  target: number,
  deadline: number,
  baseline: number,
  baselineYear: number,
  startRange: number,
  isDummy: boolean,
): Promise<any> => {
  const query = setGDCGoal(
    municipality,
    kpi,
    indicatorName,
    dataseries,
    target,
    deadline,
    baseline,
    baselineYear,
    startRange,
    isDummy,
  );
  return DB.update(query, { transform: 'toJSON' })
    .then((resp) => resp)
    .catch((err) => {
      console.log(err);
    });
};
