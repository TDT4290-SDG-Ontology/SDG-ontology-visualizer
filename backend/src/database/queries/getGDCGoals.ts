import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (
  municipality: string,
  baselineMunicipality: string,
  overrideMode: string,
): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  if (overrideMode === 'absolute') {
    return `
        ${prefixString}

        SELECT ?kpi ?baseline ?baselineYear ?target ?deadline ?startRange ?dataseries ?calculationMethod
        WHERE {
            ?indicator rdf:type SDG:U4SSCIndicator.
            ?indicator SDG:kpiNumber ?kpi.
            
            ?goal rdf:type SDG:U4SSCIndicatorGoal.
            ?goal SDG:goalDeadline ?deadline.
            ?goal SDG:goalTarget ?target.
            ?goal SDG:goalStartRange ?startRange.

            ?goal SDG:isGoalForMunicipality ?municipality.
            ?goal SDG:isGoalForDataseries ?ds.

            ?baselineGoal rdf:type SDG:U4SSCIndicatorGoal.
            ?baselineGoal SDG:goalBaseline ?baseline.
            ?baselineGoal SDG:goalBaselineYear ?baselineYear.

            ?baselineGoal SDG:isGoalForMunicipality ?baselineMuni.
            ?baselineGoal SDG:isGoalForDataseries ?ds.

            ?ds SDG:isDataSeriesFor ?indicator.
            ?ds SDG:dataseriesScoreCalculationMethod ?calculationMethod.

            OPTIONAL {
              ?ds SDG:dataseriesVariant ?dataseries.
            }

            ?municipality SDG:municipalityCode "${municipality}".
            ?baselineMuni SDG:municipalityCode "${baselineMunicipality}".
        }`;
  }

  return `
        ${prefixString}
        PREFIX ofn: <http://www.ontotext.com/sparql/functions/>

        SELECT ?kpi ?baseline ?baselineYear ?target ?deadline ?startRange ?dataseries ?calculationMethod
        WHERE {
            ?indicator rdf:type SDG:U4SSCIndicator.
            ?indicator SDG:kpiNumber ?kpi.
            
            ?goal rdf:type SDG:U4SSCIndicatorGoal.
            ?goal SDG:goalDeadline ?deadline.
            ?goal SDG:goalTarget ?goalTarget.
            ?goal SDG:goalStartRange ?startRange.
            ?goal SDG:goalBaseline ?targetBaseline.

            ?goal SDG:isGoalForMunicipality ?municipality.
            ?goal SDG:isGoalForDataseries ?ds.

            BIND(ofn:max(?targetBaseline, 0.01) as ?targetDenom).
            BIND(?goalTarget / ?targetDenom as ?targetFract).
            BIND(?targetFract * ?baseline as ?target).

            ?baselineGoal rdf:type SDG:U4SSCIndicatorGoal.
            ?baselineGoal SDG:goalBaseline ?baseline.
            ?baselineGoal SDG:goalBaselineYear ?baselineYear.

            ?baselineGoal SDG:isGoalForMunicipality ?baselineMuni.
            ?baselineGoal SDG:isGoalForDataseries ?ds.

            ?ds SDG:isDataSeriesFor ?indicator.
            ?ds SDG:dataseriesScoreCalculationMethod ?calculationMethod.

            OPTIONAL {
              ?ds SDG:dataseriesVariant ?dataseries.
            }

            ?municipality SDG:municipalityCode "${municipality}".
            ?baselineMuni SDG:municipalityCode "${baselineMunicipality}".
        }`;
};
