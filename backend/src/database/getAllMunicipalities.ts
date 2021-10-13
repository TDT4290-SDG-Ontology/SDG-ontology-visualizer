import DB from './index';
import getAllMunicipalities from './queries/getAllMunicipalities';

// TODO: Remove any
export default async (): Promise<any> => {
  const query = getAllMunicipalities();
  return DB.query(query, { transform: 'toJSON' })
    .then((resp) => resp.records)
    .catch((err) => {
      console.log(err);
    });
};
