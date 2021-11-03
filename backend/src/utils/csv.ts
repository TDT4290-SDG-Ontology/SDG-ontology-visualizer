import csvParser from 'csv-parser';
import getStream from 'get-stream';

import { promisify } from 'node:util';
import { Buffer } from 'node:buffer';
import { Readable as ReadableStream, pipeline } from 'node:stream';
import process from 'node:process';

const pipelinePromise = promisify(pipeline);

export const parseCSV = async (data: any, opts?: any): Promise<any[]> => {
  let stream = data;
  if (typeof stream === 'string' || Buffer.isBuffer(stream)) {
    stream = ReadableStream.from(stream);
  }

  const parseStream = csvParser(opts);

  // Node.js 16 has a bug with `.pipeline` for large strings. It works fine in Node.js 14 and 12.
  if (Number(process.versions.node.split('.')[0]) >= 16) {
    return getStream.array(stream.pipe(parseStream));
  }

  await pipelinePromise([stream, parseStream]);
  return getStream.array(parseStream);
};

export const detectSeparator = (header: string) => {
  const separators = [',', ';', '|', '\t'];
  const idx = separators
    .map((sep) => header.indexOf(sep))
    .reduce((acc, ind) => (acc === -1 || (ind !== -1 && ind < acc) ? ind : acc));

  return header[idx] || ',';
  // Alternate approach: try to split and detect which separator gives the expected output
};
