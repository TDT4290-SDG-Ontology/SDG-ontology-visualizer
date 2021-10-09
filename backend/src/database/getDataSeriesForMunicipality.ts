import DB from './index';
import getDataSeriesForMunicipality from './queries/getDataSeriesForMunicipality';

/**
 * Returns all datapoints for a municipality.
 */
export default async (municipality: string): Promise<any> => {
  const query = getDataSeriesForMunicipality(municipality);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
