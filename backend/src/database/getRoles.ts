import DB from './index';
import getRoles from './queries/getRoles';
import { Role } from '../types/userTypes';

export default async (): Promise<Array<Role>> => {
  const query = getRoles();
  const response = await DB.query(query, { transform: 'toJSON' });
  return response.records;
};
