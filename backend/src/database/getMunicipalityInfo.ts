import DB from './index';
import getMunicipalityInfo from './queries/getMunicipalityInfo';

// TODO: Remove any
export default async (code: string): Promise<any> => {
  const query = getMunicipalityInfo(code);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
