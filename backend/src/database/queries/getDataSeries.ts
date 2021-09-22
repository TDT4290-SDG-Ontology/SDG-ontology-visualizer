import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (kpiNumber: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  return `
        ${prefixString}
        SELECT *
        WHERE {
            ?ind rdf:type SDG:U4SSCIndicator.
            ?ind SDG:kpiNumber "${kpiNumber}".
            ?ds SDG:isDataSeriesFor ?ind.
            ?dp SDG:datapointForSeries ?ds.
            ?dp SDG:datapointValue ?value.
            ?dp SDG:datapointYear ?year.
        }`;
};
