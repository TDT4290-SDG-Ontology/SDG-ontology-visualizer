import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (municipalityCode: string, factor: number): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);

  const minFactor = 1.0 - factor;
  const maxFactor = 1.0 + factor;

  return `
      ${prefixString}
      SELECT ?name ?code ?population
      WHERE {
        ?mun rdf:type SDG:Municipality.
        ?mun SDG:municipalityPopulation ?population.
        ?mun SDG:municipalityCode ?code.
        ?mun rdfs:label ?name.

        ?currentMun rdf:type SDG:Municipality.
        ?currentMun SDG:municipalityPopulation ?currentPop.
        ?currentMun SDG:municipalityCode "${municipalityCode}".

        BIND(xsd:long((xsd:double(?currentPop) * xsd:double(${minFactor}))) as ?minPop).
        BIND(xsd:long((xsd:double(?currentPop) * xsd:double(${maxFactor}))) as ?maxPop).

        FILTER(xsd:long(?population) >= ?minPop).
        FILTER(xsd:long(?population) <= ?maxPop).
        FILTER(?mun != ?currentMun).
      }`;
};
