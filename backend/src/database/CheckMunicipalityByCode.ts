import DB from './index';
import CheckMunicipalityByCode from './queries/CheckMunicipalityByCode';

export default async (municipalityCode: string): Promise<number> => {
  const query = CheckMunicipalityByCode(municipalityCode);
  return DB.query(query, { transform: 'toJSON' })
    .then((resp) => resp.total)
    .catch((err) => {
      console.log(err);
    });
};
