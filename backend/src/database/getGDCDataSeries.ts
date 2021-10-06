import DB from './index';
import getGDCDataSeries from './queries/getGDCDataSeries';
import { Dataseries } from '../types/gdcTypes';

// TODO: Remove any
export default async (municipality: string, year: number): Promise<Dataseries[]> => {
  const query = getGDCDataSeries(municipality, year);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
