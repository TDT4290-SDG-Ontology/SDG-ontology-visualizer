import { GDCGoal } from '../../types/gdcTypes';
import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (goals: GDCGoal[]): string => {
  const prefixString = parsePrefixesToQuery(
    PREFIXES.RDF,
    PREFIXES.OWL,
    PREFIXES.SDG,
    PREFIXES.UNSDG,
  );

  let uris: string = '';
  goals.forEach((goal) => {
    const dataseries =
      goal.indicatorName +
      (goal.dataseries === undefined || goal.dataseries === 'main' ? '' : `.${goal.dataseries}`);

    const goalUri = ` <http://www.semanticweb.org/aga/ontologies/2017/9/SDG#goals.u4ssc.${dataseries}.${goal.municipality}>`;
    uris = uris.concat(goalUri);
  });

  return `
    ${prefixString}
    delete {
      ?uri ?prop ?val.
    }
    where {
      VALUES ?uri { ${uris} }.
      ?uri ?prop ?val.
    }`;
};
