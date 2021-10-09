import { Node } from '../types/ontologyTypes';
import { ApiError } from '../types/errorTypes';
import { mapRecordToObject } from '../common/database';
import DB from './index';
import getDevelopmentArea from './queries/getDevelopmentArea';

export default async (nodeId: string): Promise<Array<Node>> => {
  const query = getDevelopmentArea(nodeId);
  if (!nodeId) {
    throw new ApiError(400, 'Could not parse ontology entity from the given class ID');
  }
  return DB.query(query, { transform: 'toJSON' }).then((resp) =>
    resp.records.map(mapRecordToObject),
  );
};
