import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (username: string, password: string, role: string): string => {
  const prefixString = parsePrefixesToQuery(PREFIXES.SDG);
  return `
    ${prefixString}
    insert {
      ?uri rdf:type SDG:User .
      ?uri SDG:username "${username}".
      ?uri SDG:passwordHash "${password}".
      ?uri SDG:userHasRole ?role.
   }
   where {
    BIND(IRI("http://www.semanticweb.org/aga/ontologies/2017/9/SDG#sdg.user.${username}") as ?uri)
    BIND(IRI("http://www.semanticweb.org/aga/ontologies/2017/9/SDG#sdg.userrole.${role}") as ?role)
   }`;
};
