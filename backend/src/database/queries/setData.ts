import { DataPoint } from 'types/ontologyTypes';
import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (obj: DataPoint): string => {
  const prefixString = parsePrefixesToQuery(
    PREFIXES.RDF,
    PREFIXES.OWL,
    PREFIXES.SDG,
    PREFIXES.UNSDG,
  );
  const dummyDataString = obj.isDummy ? '?uri SDG:isDummyData true.' : '';
  const dataseriesVariant =
    obj.dataseries === undefined || obj.dataseries === 'main'
      ? ''
      : `?dataseries SDG:dataseriesVariant "${obj.dataseries}".`;

  return `
    ${prefixString}
    insert {
      ?uri rdf:type SDG:Datapoint .
      ?uri SDG:datapointForSeries ?dataseries.
      ?uri SDG:datapointForMunicipality ?municipality.
      ?uri SDG:datapointYear ${obj.year}.
      ?uri SDG:datapointValue ${obj.data}.

      ${dummyDataString}
   }
   where {
      BIND(IRI(CONCAT("http://www.semanticweb.org/aga/ontologies/2017/9/SDG#datapoint.u4ssc.${obj.indicatorName}.", strUUID())) as ?uri)

      ?municipality SDG:municipalityCode "${obj.municipality}".

      ?dataseries SDG:isDataSeriesFor ?indicator.

      ${dataseriesVariant}

      ?indicator SDG:kpiNumber "${obj.indicatorId}".
   }`;
};
