import { DataPoint } from '../types/ontologyTypes';
import DB from './index';
import bulkDeleteDataPoints from './queries/bulkDeleteDataPoints';

export default async (dataPoints: DataPoint[]): Promise<any> => {
  const query = bulkDeleteDataPoints(dataPoints);
  return DB.update(query, { transform: 'toJSON' }).catch((err) => {
    console.log(err);
  });
};
