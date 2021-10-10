import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (code: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);

  return `
      ${prefixString}
      SELECT ?name ?code ?population
      WHERE {
        BIND("${code}" as ?code).

        ?mun rdf:type SDG:Municipality.
        ?mun SDG:municipalityPopulation ?population.
        ?mun SDG:municipalityCode ?code.
        ?mun rdfs:label ?name.
      }`;
};
