import DB from './index';
import deleteGDCGoal from './queries/deleteGDCGoal';

export default async (
  municipality: string,
  kpi: string,
  dataseries: string,
  isDummy: boolean,
): Promise<any> => {
  const query = deleteGDCGoal(municipality, kpi, dataseries, isDummy);
  const resp = await DB.update(query, { transform: 'toJSON' });
  return resp;
};
