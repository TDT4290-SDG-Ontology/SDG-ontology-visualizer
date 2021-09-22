import DB from './index';
import getDataSeries from './queries/getDataSeries';

// TODO: Remove any
export default async (kpiNumber: string): Promise<any> => {
  const query = getDataSeries(kpiNumber);
  const response = await DB.query(query, { transform: 'toJSON' });
  return response;
};
