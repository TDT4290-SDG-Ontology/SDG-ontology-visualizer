import DB from './index';
import { Role } from '../types/userTypes';
import getUserRole from './queries/getUserRole';

export default async (username: string): Promise<Array<Role>> => {
  const query = getUserRole(username);
  const response = await DB.query(query, { transform: 'toJSON' });
  return response.records;
};
