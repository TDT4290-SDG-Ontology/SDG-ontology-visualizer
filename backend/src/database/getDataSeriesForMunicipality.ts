import DB from './index';
import getDataSeriesForMunicipality from './queries/getDataSeriesForMunicipality';

/**
 * Returns all datapoints for a municipality.
 */
export default async (municipality: string): Promise<any> => {
  const query = getDataSeriesForMunicipality(municipality);
  const response = await DB.query(query, { transform: 'toJSON' });
  return response.records;
};
