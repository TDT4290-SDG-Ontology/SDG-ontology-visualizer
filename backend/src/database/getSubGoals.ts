import { Node } from '../types/ontologyTypes';
import { ApiError } from '../types/errorTypes';
import DB from './index';
import getSubGoals from './queries/getSubGoals';

export default async (nodeId: string): Promise<Array<Node>> => {
  const query = getSubGoals(nodeId);
  if (!nodeId) {
    throw new ApiError(400, 'Could not parse ontology entity from the given class ID');
  }
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
