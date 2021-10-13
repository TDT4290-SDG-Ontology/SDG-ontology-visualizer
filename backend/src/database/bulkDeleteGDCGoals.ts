import { GDCGoal } from '../types/gdcTypes';
import DB from './index';
import bulkDeleteGDCGoals from './queries/bulkDeleteGDCGoals';

export default async (goals: GDCGoal[]): Promise<any> => {
  const query = bulkDeleteGDCGoals(goals);
  return DB.update(query, { transform: 'toJSON' }).catch((err) => {
    console.log(err);
  });
};
