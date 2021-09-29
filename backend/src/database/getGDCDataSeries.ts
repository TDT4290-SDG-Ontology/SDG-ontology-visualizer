import DB from './index';
import getGDCDataSeries from './queries/getGDCDataSeries';

// TODO: Remove any
export default async (municipality: string, year: number): Promise<any> => {
  const query = getGDCDataSeries(municipality, year);
  return DB.query(query, { transform: 'toJSON' }).then(resp => { return resp; });
};
