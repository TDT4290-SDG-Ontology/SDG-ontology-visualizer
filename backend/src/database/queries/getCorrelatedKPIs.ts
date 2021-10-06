import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (correlationCountry: string, kpi: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  return `
        ${prefixString}
        SELECT ?kpi ?correlation ?subgoal
        WHERE {
          ?fromKpi SDG:kpiNumber "${kpi}".
          ?fromKpi SDG:linkedSDGSubgoal ?fromSubgoal.

          ?corrUri SDG:subgoalCorrelationTo ?fromSubgoal.
          ?corrUri SDG:subgoalCorrelationFrom ?toSubgoal.

          ?toSubgoal rdfs:label ?subgoal.

          ?toKpi SDG:linkedSDGSubgoal ?toSubgoal.
          ?toKpi SDG:kpiNumber ?kpi.

          ?corrUri SDG:subgoalCorrelationCountry "${correlationCountry}"^^xsd:string.
          ?corrUri SDG:subgoalCorrelationFactor ?correlation.
        }`;
};
