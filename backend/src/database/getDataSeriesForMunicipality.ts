import DB from './index';
import getDataSeriesForMunicipality from './queries/getDataSeriesForMunicipality';

export default async (municipality: string): Promise<any> => {
  const query = getDataSeriesForMunicipality(municipality);
  console.log(query);
  const response = await DB.query(query, { transform: 'toJSON' });
  return response.records;
};
