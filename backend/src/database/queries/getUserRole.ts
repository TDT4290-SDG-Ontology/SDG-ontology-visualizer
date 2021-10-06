import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (username: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);

  return `
      ${prefixString}
      SELECT ?role
      WHERE {
        ?user SDG:username "${username}".
        ?user SDG:userHasRole ?role.
      }`;
};
