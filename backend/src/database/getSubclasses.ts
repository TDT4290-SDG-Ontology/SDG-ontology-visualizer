import DB from './index';
import { Node } from '../types/ontologyTypes';
import getSubclasses from './queries/getSubclasses';
import { mapIdToOntologyEntity } from '../common/database';

export default async (classId: string): Promise<Array<Node>> => {
  const query = getSubclasses(classId);
  return DB.query(query, { transform: 'toJSON' }).then((resp) =>
    resp.records.map((rec) => mapIdToOntologyEntity(rec.directSub)),
  );
};
