import DB from './index';
import getUser from './queries/getUser';

export default async (username: string): Promise<Array<string>> => {
  const query = getUser(username);
  const response = await DB.query(query, { transform: 'toJSON' });
  return response.records;
};
