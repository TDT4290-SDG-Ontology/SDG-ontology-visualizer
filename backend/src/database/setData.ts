import { ApiError } from '../types/errorTypes';
import DB from './index';
import setData from './queries/setData';


export default async (newClass: any): Promise<string> => {
  const query = setData(newClass);
  if (!newClass) {
    throw new ApiError(400, 'Could not parse ontology entity from the given class ID');
  }
  const response = await DB.query(query, { transform: 'toString' });
  return response;
};
