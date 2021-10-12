import DB from './index';
import getCorrelatedKPIs from './queries/getCorrelatedKPIs';

// TODO: Remove any
export default async (correlationCountry: string, kpi: string): Promise<any> => {
  const query = getCorrelatedKPIs(correlationCountry, kpi);
  return DB.query(query, { transform: 'toJSON' })
    .then((resp) => resp.records)
    .catch((err) => {
      console.log(err);
    });
};
