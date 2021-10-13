import { DataPoint } from '../types/ontologyTypes';
import DB from './index';

import bulkInsertDataPoints from './queries/bulkInsertDataPoints';
import getMunicipalityURI from './queries/getMunicipalityURI';

export default async (muniCode: string, dataPoints: DataPoint[]): Promise<any> => {
  const muniUriQuery = getMunicipalityURI(muniCode);
  const muniResp = await DB.query(muniUriQuery, { transform: 'toJSON' }).catch((err) => {
    console.log(err);
  });
  const muniUri = muniResp.records[0].uri;

  const query = bulkInsertDataPoints(muniUri, dataPoints);
  return DB.update(query, { transform: 'toJSON' }).catch((err) => {
    console.log(err);
  });
};
