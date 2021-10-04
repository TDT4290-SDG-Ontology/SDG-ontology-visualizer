import DB from './index';
import getGDCGoals from './queries/getGDCGoals';
import { Goal } from '../types/gdcTypes';

// TODO: Remove any
export default async (municipality: string): Promise<Goal[]> => {
  const query = getGDCGoals(municipality);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
