import DB from './index';
import { Role } from '../types/userTypes';
import getUserRole from './queries/getUserRole';

export default async (username: string): Promise<Array<Role>> => {
  const query = getUserRole(username);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
