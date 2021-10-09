import DB from './index';
import { Annotation } from '../types/ontologyTypes';
import getAnnotations from './queries/getAnnotations';

export default async (classId: string): Promise<Annotation> => {
  const query = getAnnotations(classId);
  return DB.query(query, { transform: 'toJSON' }).then((resp) => resp.records[0]);
};
