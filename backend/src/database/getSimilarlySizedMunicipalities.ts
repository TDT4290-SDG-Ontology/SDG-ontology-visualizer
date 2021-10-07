import DB from './index';
import getSimilarlySizedMunicipalities from './queries/getSimilarlySizedMunicipalities';
import { Goal } from '../types/gdcTypes';

// TODO: Remove any
export default async (municipality: string, factor: number): Promise<any> => {
  const query = getSimilarlySizedMunicipalities(municipality, factor);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};