import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);

  return `
      ${prefixString}
      SELECT ?name ?code ?population
      WHERE {
        ?mun rdf:type SDG:Municipality.
        ?mun SDG:municipalityPopulation ?population.
        ?mun SDG:municipalityCode ?code.
        ?mun rdfs:label ?name.
      }`;
};
