import DB from './index';
import { HashEntry } from '../types/userTypes';
import getUserPasswordHash from './queries/getUserPasswordHash';

export default async (username: string): Promise<Array<HashEntry>> => {
  const query = getUserPasswordHash(username);
  const response = await DB.query(query, { transform: 'toJSON' });
  return response.records;
};
