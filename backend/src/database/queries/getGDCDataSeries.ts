import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (municipality: string, year: number): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  return `
        ${prefixString}
        SELECT ?kpi ?year ?value ?dataseries
        WHERE {
            ?ind rdf:type SDG:U4SSCIndicator.
            ?ind SDG:kpiNumber ?kpi.
            
            ?ds SDG:isDataSeriesFor ?ind.
            
            ?dp SDG:datapointForSeries ?ds.
            ?dp SDG:datapointValue ?value.
            ?dp SDG:datapointYear ?${year}.

            ?dp SDG:datapointForMunicipality ?mun.
            ?mun SDG:municipalityCode "${municipality}".

            Optional {
              ?ds SDG:dataseriesVariant ?dataseries.
            }
        }`;
};
