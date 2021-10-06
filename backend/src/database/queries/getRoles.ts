import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);

  return `
      ${prefixString}
      SELECT ?role
      WHERE {
        ?r SDG:rolename ?role.
      }`;
};
