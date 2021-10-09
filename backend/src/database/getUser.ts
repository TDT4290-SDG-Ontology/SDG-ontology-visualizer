import DB from './index';
import getUser from './queries/getUser';

export default async (username: string): Promise<Array<string>> => {
  const query = getUser(username);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
