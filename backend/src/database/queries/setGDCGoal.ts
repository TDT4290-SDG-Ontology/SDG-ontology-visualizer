import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (
  municipality: string,
  kpi: string,
  indicatorName: string,
  dataseries: string,
  target: number,
  deadline: number,
  baseline: number,
  baselineYear: number,
  startRange: number,
  isDummy: boolean,
): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  const dummyDataString = isDummy ? '?uri SDG:isDummyData true.' : '';
  const dataseriesVariant =
    dataseries === undefined || dataseries === 'main'
      ? ''
      : `?dataseries SDG:dataseriesVariant "${dataseries}".`;

  return `
    ${prefixString}
    insert {
      ?uri rdf:type SDG:U4SSCIndicatorGoal .
      ?uri SDG:goalStartRange ${startRange}.
      ?uri SDG:goalBaseline ${baseline}.
      ?uri SDG:goalBaselineYear ${baselineYear}.
      ?uri SDG:goalTarget ${target}.
      ?uri SDG:goalDeadline ${deadline}.

      ?uri SDG:isGoalForMunicipality ?municipality.
      ?uri SDG:isGoalForDataseries ?dataseries.

      ${dummyDataString}
   }
   where {
      BIND(IRI("http://www.semanticweb.org/aga/ontologies/2017/9/SDG#goals.u4ssc.${dataseries}.${municipality}") as ?uri)

      ?municipality SDG:municipalityCode "${municipality}".

      ?dataseries SDG:isDataSeriesFor ?indicator.

      ${dataseriesVariant}

      ?indicator SDG:kpiNumber "${kpi}".
   }`;
};
