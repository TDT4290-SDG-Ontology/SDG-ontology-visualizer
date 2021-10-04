import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (
  municipality: string,
  kpi: string,
  dataseries: string,
  isDummy: boolean,
): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  const dummyDataString = isDummy ? '?uri SDG:isDummyData true.' : '';
  const dataseriesVariant =
    dataseries === undefined || dataseries === 'main'
      ? ''
      : `?dataseries SDG:dataseriesVariant "${dataseries}".`;

  // TODO: use OPTIONAL to delete existing goals without requiring knowledge of previous
  // value...
  return `
    ${prefixString}
    delete {
      ?uri rdf:type SDG:U4SSCIndicatorGoal .
      ?uri SDG:goalStartRange ?startRange.
      ?uri SDG:goalBaseline ?baseline.
      ?uri SDG:goalBaselineYear ?baselineYear.
      ?uri SDG:goalTarget ?target.
      ?uri SDG:goalDeadline ?deadline.

      ?uri SDG:isGoalForMunicipality ?municipality.
      ?uri SDG:isGoalForDataseries ?dataseries.

      ${dummyDataString}
   }
   where {

      ?uri rdf:type SDG:U4SSCIndicatorGoal .
      ?uri SDG:goalStartRange ?range.
      ?uri SDG:goalBaseline ?baseline.
      ?uri SDG:goalBaselineYear ?baselineYear.
      ?uri SDG:goalTarget ?target.
      ?uri SDG:goalDeadline ?deadline.

      ?uri SDG:isGoalForMunicipality ?municipality.
      ?uri SDG:isGoalForDataseries ?dataseries.

      ${dummyDataString}

      ?municipality SDG:municipalityCode "${municipality}".

      ?dataseries SDG:isDataSeriesFor ?indicator.

      ${dataseriesVariant}

      ?indicator SDG:kpiNumber "${kpi}".
   }`;
};
