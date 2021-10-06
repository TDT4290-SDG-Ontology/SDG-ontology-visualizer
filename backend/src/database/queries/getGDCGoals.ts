import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (municipality: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  return `
        ${prefixString}
        SELECT ?kpi ?baseline ?baselineYear ?target ?deadline ?startRange ?dataseries ?calculationMethod
        WHERE {
            ?indicator rdf:type SDG:U4SSCIndicator.
            ?indicator SDG:kpiNumber ?kpi.
            
            ?goal rdf:type SDG:U4SSCIndicatorGoal.
            ?goal SDG:goalBaseline ?baseline.
            ?goal SDG:goalBaselineYear ?baselineYear.
            ?goal SDG:goalDeadline ?deadline.
            ?goal SDG:goalTarget ?target.
            ?goal SDG:goalStartRange ?startRange.

            ?goal SDG:isGoalForMunicipality ?municipality.
            ?goal SDG:isGoalForDataseries ?ds.

            ?ds SDG:isDataSeriesFor ?indicator.
            ?ds SDG:dataseriesScoreCalculationMethod ?calculationMethod.

            OPTIONAL {
              ?ds SDG:dataseriesVariant ?dataseries.
            }

            ?municipality SDG:municipalityCode "${municipality}".
        }`;
};
