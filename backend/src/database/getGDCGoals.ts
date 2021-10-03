import DB from './index';
import getGDCGoals from './queries/getGDCGoals';

// TODO: Remove any
export default async (municipality: string, year: number): Promise<any> => {
  const query = getGDCGoals(municipality, year);
  return DB.query(query, { transform: 'toJSON' }).then(resp => { return resp; });
};
