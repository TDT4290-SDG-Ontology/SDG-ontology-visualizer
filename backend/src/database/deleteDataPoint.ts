import { DataPoint } from 'types/ontologyTypes';
import { ApiError } from '../types/errorTypes';
import DB from './index';
import deleteDataPoint from './queries/deleteDataPoint';

export default async (dataPoint: DataPoint): Promise<any> => {
  if (!dataPoint) {
    throw new ApiError(400, 'Could not parse ontology entity from the given class ID');
  }

  const query = deleteDataPoint(dataPoint);
  const resp = await DB.update(query, { transform: 'toJSON' });
  return resp;
};
