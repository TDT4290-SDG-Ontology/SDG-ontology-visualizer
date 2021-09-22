import DB from './index';
import getDataSeries from './queries/getDataSeries';

// TODO: Remove any once looking at the return types a bit
export default async (kpiNumber: string): Promise<any> => {
  const query = getDataSeries(kpiNumber);
  console.log('Query: ', query);
  const response = await DB.query(query, { transform: 'toJSON' });
  console.log(response);
  return response;
};
