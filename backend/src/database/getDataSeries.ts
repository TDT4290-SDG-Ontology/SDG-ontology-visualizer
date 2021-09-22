import DB from './index';
import getDataSeries from './queries/getDataSeries';

// TODO: Remove any
export default async (kpiNumber: string): Promise<any> => {
  const query = getDataSeries(kpiNumber);
  console.log('Query: ', query);
  const response = await DB.query(query, { transform: 'toJSON' });
  console.log(response);
  return response;
};
