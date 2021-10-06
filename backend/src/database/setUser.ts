import DB from './index';
import setUser from './queries/setUser';

export default async (username: string, password: string, role: string): Promise<any> => {
  const query = setUser(username, password, role);
  const resp = await DB.update(query, { transform: 'toJSON' });
  return resp;
};
