import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (code: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);

  return `
      ${prefixString}
      SELECT ?uri
      WHERE {
        BIND("${code}" as ?code).
        ?uri rdf:type SDG:Municipality.
        ?uri SDG:municipalityCode ?code.
      }`;
};
