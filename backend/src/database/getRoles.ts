import DB from './index';
import getRoles from './queries/getRoles';
import { Role } from '../types/userTypes';

export default async (): Promise<Array<Role>> => {
  const query = getRoles();
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
