import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (username: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);

  return `
      ${prefixString}
      SELECT ?hash
      WHERE { 
        ?user SDG:username "${username}".
        ?user SDG:passwordHash ?hash.
      }`;
};
