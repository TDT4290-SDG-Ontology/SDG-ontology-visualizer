import DB from './index';
import getGDCGoals from './queries/getGDCGoals';
import { Goal } from '../types/gdcTypes';

export default async (
  municipality: string,
  baselineMunicipality: string,
  overrideMode: string,
): Promise<Goal[]> => {
  const query = getGDCGoals(municipality, baselineMunicipality, overrideMode);
  return DB.query(query, { transform: 'toJSON' })
    .then((resp) => resp.records)
    .catch((err) => {
      console.log(err);
    });
};
