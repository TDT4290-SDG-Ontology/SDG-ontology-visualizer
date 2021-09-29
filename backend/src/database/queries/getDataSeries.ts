import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (
  kpiNumber: string,
  municipality: string,
  year: number,
  dataseries?: string,
): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  const dataseriesVariant =
    dataseries === undefined
      ? `OPTIONAL {
      ?ds SDG:dataseriesVariant ?dataseriesVariant.
    }`
      : `?ds SDG:dataseriesVariant "${dataseries}".`;
  return `
        ${prefixString}
        SELECT ?value ?dataseriesVariant
        WHERE {
            ?ind rdf:type SDG:U4SSCIndicator.
            ?ind SDG:kpiNumber "${kpiNumber}".
            ?ds SDG:isDataSeriesFor ?ind.
            ?dp SDG:datapointForSeries ?ds.
            ?dp SDG:datapointValue ?value.
            ?dp SDG:datapointYear ${year}.

            ?municipality SDG:municipalityCode "${municipality}".
            ?dp SDG:datapointForMunicipality ?municipality.

            ${dataseriesVariant}
        }`;
};
