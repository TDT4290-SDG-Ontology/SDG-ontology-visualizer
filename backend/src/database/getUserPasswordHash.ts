import DB from './index';
import { HashEntry } from '../types/userTypes';
import getUserPasswordHash from './queries/getUserPasswordHash';

export default async (username: string): Promise<Array<HashEntry>> => {
  const query = getUserPasswordHash(username);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
