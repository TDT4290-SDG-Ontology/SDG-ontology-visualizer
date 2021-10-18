import { GDCGoal } from '../../types/gdcTypes';
import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (muniURI: string, goals: GDCGoal[]): string => {
  const prefixString = parsePrefixesToQuery(
    PREFIXES.RDF,
    PREFIXES.OWL,
    PREFIXES.SDG,
    PREFIXES.UNSDG,
  );

  let insertStatements = '';
  goals.forEach((goal) => {
    const dataseries =
      goal.indicatorName +
      (goal.dataseries === undefined || goal.dataseries === 'main' ? '' : `.${goal.dataseries}`);

    const goalUri = `<http://www.semanticweb.org/aga/ontologies/2017/9/SDG#goals.u4ssc.${dataseries}.${goal.municipality}>`;
    const dsUri = `<http://www.semanticweb.org/aga/ontologies/2017/9/SDG#dataseries.${dataseries}>`;

    const dummyString = goal.isDummy ? '' : `${goalUri} SDG:isDummyData true.`;

    insertStatements = insertStatements.concat(
      `
       ${goalUri} rdf:type SDG:U4SSCIndicatorGoal.
       ${goalUri} SDG:isGoalForMunicipality <${muniURI}>.
       ${goalUri} SDG:isGoalForDataseries ${dsUri}.

       ${goalUri} SDG:goalStartRange ${goal.startRange}.
       ${goalUri} SDG:goalTarget ${goal.target}.
       ${goalUri} SDG:goalDeadline ${goal.deadline}.
       ${goalUri} SDG:goalBaseline ${goal.baseline}.
       ${goalUri} SDG:goalBaselineYear ${goal.baselineYear}.
       ${dummyString}`,
    );
  });

  return `
    ${prefixString}
    insert data {
      ${insertStatements}
   }`;
};
