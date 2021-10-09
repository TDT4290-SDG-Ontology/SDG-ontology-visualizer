import DB from './index';
import { Node } from '../types/ontologyTypes';
import getClassesByString from './queries/getClassesByString';
import { isNotNull, mapRecordToSubject } from '../common/database';

export default async (searchTerm: string, limitResults?: number): Promise<Array<Node>> => {
  const query = getClassesByString(searchTerm, limitResults);
  return DB.query(query, { transform: 'toJSON' }).then((resp) =>
    resp.records.map(mapRecordToSubject).filter(isNotNull),
  );
};
