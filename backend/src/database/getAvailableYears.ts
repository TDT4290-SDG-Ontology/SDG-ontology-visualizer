import DB from './index';
import getAvailableYears from './queries/getAvailableYears';

// TODO: Remove any
export default async (municipality: string): Promise<any> => {
  const query = getAvailableYears(municipality);
  return DB.query(query, { transform: 'toJSON' }).then((resp) =>
    resp.records.map((obj) => obj.year),
  );
};
