import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

/**
 * Returns SPARQL Query for getting all datapoints for a municipality.
 */
export default (municipality: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG, PREFIXES.SCHEMA, PREFIXES.RDFS);

  return `
        ${prefixString}
        SELECT DISTINCT ?year
        WHERE {
            ?dp SDG:datapointYear ?year.
            ?municipality SDG:municipalityCode "${municipality}".
            ?dp SDG:datapointForMunicipality ?municipality.
        }`;
};
