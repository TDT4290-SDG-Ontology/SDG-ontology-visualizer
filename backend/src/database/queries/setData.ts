import {
  mapIdToOntologyEntity,
  parseOntologyEntityToQuery,
} from '../../common/database';
// import { PREFIXES } from '../index';

export default (newClass: any): string => {
  const prefixString =
    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
    'PREFIX owl: <http://www.w3.org/2002/07/owl#>\n' +
    'PREFIX SDG: <http://www.semanticweb.org/aga/ontologies/2017/9/SDG#>';
  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  const dateTime = `${date} ${time}`;
  console.log(dateTime);
  return `
    ${prefixString}
    insert data {
      'SDG:'+${newClass.name} rdf:type owl:Class .
      'SDG:'+${newClass.name} SDG:description ${newClass.discription}.
      'SDG:'+${newClass.name} SDG:moreInformation ${newClass.moreInformation}.
   } `;
};
