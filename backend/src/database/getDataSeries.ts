import DB from './index';
import getDataSeries from './queries/getDataSeries';

// TODO: Remove any
export default async (kpiNumber: string, municipality: string, year: number): Promise<any> => {
  const query = getDataSeries(kpiNumber, municipality, year);
  console.log(query);
  const response = await DB.query(query, { transform: 'toJSON' });
  return response.records;
};
