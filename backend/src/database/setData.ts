import { ApiError } from '../types/errorTypes';
import DB from './index';
import setData from './queries/setData';
import { DataPoint } from 'types/ontologyTypes';


export default async (newDataPoint: DataPoint): Promise<string> => {
    const query = setData(newDataPoint);
    if (!newDataPoint) {
    throw new ApiError(400, 'Could not parse ontology entity from the given class ID');
  }
  const response = await DB.query(query, { transform: 'toString' });
  return response;
};
