import DB from './index';
import deleteGDCGoal from './queries/deleteGDCGoal';

export default async (
  municipality: string,
  kpi: string,
  dataseries: string,
  isDummy: boolean,
): Promise<any> => {
  const query = deleteGDCGoal(municipality, kpi, dataseries, isDummy);
  return DB.update(query, { transform: 'toJSON' }).catch((err) => {
    console.log(err);
  });
};
