import DB from './index';
import setMunicipality from './queries/setMunicipality';

export default async (code: string, name: string, population: number): Promise<any> => {
  const query = setMunicipality(code, name, population);
  return DB.update(query, { transform: 'toJSON' }).catch((err) => {
    console.log(err);
  });
};
