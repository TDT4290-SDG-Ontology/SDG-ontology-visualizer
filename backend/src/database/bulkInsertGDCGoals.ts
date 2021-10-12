import { GDCGoal } from '../types/gdcTypes';
import DB from './index';

import bulkInsertGDCGoals from './queries/bulkInsertGDCGoals';
import getMunicipalityURI from './queries/getMunicipalityURI';

export default async (muniCode: string, goals: GDCGoal[]): Promise<any> => {
  const muniUriQuery = getMunicipalityURI(muniCode);
  const muniResp = await DB.query(muniUriQuery, { transform: 'toJSON' }).catch((err) => {
    console.log(err);
  });
  const muniUri = muniResp.records[0].uri;

  const query = bulkInsertGDCGoals(muniUri, goals);
  return DB.update(query, { transform: 'toJSON' }).catch((err) => {
    console.log(err);
  });
};
