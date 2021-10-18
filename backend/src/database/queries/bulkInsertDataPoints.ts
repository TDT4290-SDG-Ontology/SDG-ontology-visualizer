import { DataPoint } from '../../types/ontologyTypes';
import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (muniURI: string, data: DataPoint[]): string => {
  const prefixString = parsePrefixesToQuery(
    PREFIXES.RDF,
    PREFIXES.OWL,
    PREFIXES.SDG,
    PREFIXES.UNSDG,
  );

  let insertStatements = '';
  data.forEach((dp) => {
    const dataseries =
      dp.indicatorName +
      (dp.dataseries === undefined || dp.dataseries === 'main' ? '' : `.${dp.dataseries}`);

    const dpUri = `<http://www.semanticweb.org/aga/ontologies/2017/9/SDG#datapoint.u4ssc.${dataseries}.${dp.municipality}.${dp.year}>`;
    const dsUri = `<http://www.semanticweb.org/aga/ontologies/2017/9/SDG#dataseries.${dataseries}>`;

    const dummyString = dp.isDummy ? '' : `${dpUri} SDG:isDummyData true.`;

    insertStatements = insertStatements.concat(
      `
       ${dpUri} rdf:type SDG:Datapoint.
       ${dpUri} SDG:datapointForSeries ${dsUri}.
       ${dpUri} SDG:datapointForMunicipality <${muniURI}>.
       ${dpUri} SDG:datapointValue ${dp.data}.
       ${dpUri} SDG:datapointYear ${dp.year}.
       ${dummyString}`,
    );
  });

  return `
    ${prefixString}
    insert data {
      ${insertStatements}
   }`;
};
