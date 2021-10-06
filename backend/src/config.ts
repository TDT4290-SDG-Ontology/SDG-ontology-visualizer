import dotenv from 'dotenv-safe';

dotenv.config({
  allowEmptyValues: true,
});

const PORT = process.env.PORT || 3001;

export default {
  PORT,
  GRAPHDB_BASE_URL: process.env.GRAPHDB_BASE_URL || 'http://stud211001.idi.ntnu.no:7200',
  GRAPHDB_REPOSITORY: process.env.GRAPHDB_REPOSITORY || 'TK_SDG',
  GRAPHDB_USERNAME: process.env.GRAPHDB_USERNAME || 'readAll',
  GRAPHDB_PASSWORD: process.env.GRAPHDB_PASSWORD || 'readAllPassword',
  GRAPHDB_CONTEXT_TEST: process.env.GRAPHDB_CONTEXT_TEST || '',
  JWT_SECRET_TOKEN: process.env.JWT_SECRET_TOKEN || 'someToken',
};
