import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (code: string, name: string, population: number): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);
  return `
    ${prefixString}
    insert {
      ?uri rdf:type SDG:Municipality.
      ?uri SDG:municipalityPopulation ${population}.
      ?uri SDG:municipalityCode "${code}".
      ?uri rdfs:label "${name}".
   }
   where {
    BIND(IRI("http://www.semanticweb.org/aga/ontologies/2017/9/SDG#municipality.${code}") as ?uri).
   }`;
};
