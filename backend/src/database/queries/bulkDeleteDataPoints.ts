import { DataPoint } from '../../types/ontologyTypes';
import { parsePrefixesToQuery } from '../../common/database';
import { PREFIXES } from '../index';

export default (data: DataPoint[]): string => {
  const prefixString = parsePrefixesToQuery(
    PREFIXES.RDF,
    PREFIXES.OWL,
    PREFIXES.SDG,
    PREFIXES.UNSDG,
  );

  let uris: string = '';
  data.forEach((dp) => {
    const dataseries =
      dp.indicatorName +
      (dp.dataseries === undefined || dp.dataseries === 'main' ? '' : `.${dp.dataseries}`);

    const dpUri = ` <http://www.semanticweb.org/aga/ontologies/2017/9/SDG#datapoint.u4ssc.${dataseries}.${dp.municipality}.${dp.year}>`;
    uris = uris.concat(dpUri);
  });

  return `
    ${prefixString}
    delete {
      ?uri ?prop ?val.
    }
    where {
      VALUES ?uri { ${uris} }.
      ?uri ?prop ?val.
    }`;
};
