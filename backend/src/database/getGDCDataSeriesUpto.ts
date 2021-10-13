import DB from './index';
import getGDCDataSeriesUpto from './queries/getGDCDataSeriesUpto';
import { Dataseries } from '../types/gdcTypes';

export default async (municipality: string, endYear: number): Promise<Dataseries[]> => {
  const query = getGDCDataSeriesUpto(municipality, endYear);
  return DB.query(query, { transform: 'toJSON' })
    .then((resp) => resp.records)
    .catch((err) => {
      console.log(err);
    });
};
