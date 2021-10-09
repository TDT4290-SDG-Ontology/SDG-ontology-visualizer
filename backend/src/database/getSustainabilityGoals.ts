import DB from './index';
import { Node } from '../types/ontologyTypes';
import getSustainabilityGoals from './queries/getSustainabilityGoals';

export default async (): Promise<Array<Node>> => {
  const query = getSustainabilityGoals();
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records);
};
