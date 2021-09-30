import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (municipalityCode: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);

  return `
        ${prefixString}
        SELECT ?municipality_name {
            ?municipality_name SDG:municipalityCode "${municipalityCode}".
        }`;
};
