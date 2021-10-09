import DB from './index';
import CheckMunicipalityByCode from './queries/CheckMunicipalityByCode';

export default async (municipalityCode: string): Promise<number> => {
  const query = CheckMunicipalityByCode(municipalityCode);
  const response = await DB.query(query, { transform: 'toJSON' });
  return response.total;
};
