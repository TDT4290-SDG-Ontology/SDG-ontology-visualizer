import { ApiError } from '../types/errorTypes';
import DB from './index';
import setData from './queries/setData';
import { DataPoint } from 'types/ontologyTypes';

export default async (newDataPoint: DataPoint): Promise<any> => {

  if (!newDataPoint) {
    throw new ApiError(400, 'Could not parse ontology entity from the given class ID');
  }

  const query = setData(newDataPoint);
  const resp = await DB.update(query, { transform: 'toJSON' });
  return resp
};
