import request from 'supertest';
import { expect } from 'chai';
import app from '../index';

const agent = request.agent(app, {});

// Wait until API is connected before running tests
before((done) => {
  app.on('serverStarted', () => {
    done();
  });
});
describe('Check liveness probe', () => {
  it('GET /isAlive returns "true"', async () => {
    const response = await agent.get('/api/isAlive');
    expect(response.statusCode).to.eq(200);
    expect(response.text).to.eq('true');
  });
});
describe('Check logged-in probe ', () => {
  it('/isLoggedIn returns "true"', async () => {
    const response = await agent.get('/api/isLoggedIn');
    expect(response.statusCode).to.eq(200);
    expect(response.text).to.eq('true');
  });
});
describe('Login test with invalid user', () => {
  it('returns "400: Bad Request"', async () => {
    agent
      .post('/api/auth/login')
      .send({
        username: '-',
        password: '1234',
      })
      .expect(400);
  });
});

let token: string;
const value = 6; // TODO: Find a better name

describe('Login test with valid user', () => {
  it('returns a token', async () => {
    const response = await agent.post('/api/auth/login').send({
      username: 'test',
      password: '123',
    });
    expect(response.statusCode).to.eq(200);
    expect(response.body).have.property('token');
    token = response.body.token;
  });
});

describe('Insertion test with valid values', () => {
  it('returns status 200', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: ICT: 1C',
      municipality: 'Trondheim',
      data: 1,
      dataseries: 'dataseries',
      year: 2020,
      isDummy: true,
      token,
    });
    expect(response.status).equal(200);
  });
  it('returns status 500 on unkown/invalid indicator"', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: 1C',
      municipality: 'Trondheim',
      data: 1,
      dataseries: 'dataseries',
      year: 2020,
      isDummy: true,
      token,
    });
    expect(response.status).equal(500);
    expect(response.body.message).have.string('Unknown indicator');
  });
  it('returns 200 on valid values and undefined dataseries', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: ICT: 1C',
      municipality: 'no.5001',
      data: value,
      year: 2020,
      isDummy: true,
      token,
    });

    expect(response.status).equal(200);
  });
  it('returns the inserted values', async () => {
    const response = await agent.post('/api/data/get').send({
      indicator: 'EC: ICT: ICT: 1C',
      municipality: 'no.5001',
      year: 2020,
    });

    expect(response.status).equal(200);
    expect(response.body).not.eq({});
    expect(response.body[0]).have.property('value');
    expect(response.body[0].value).equal(value);
  });
});

describe('Insertion test with invalid indicator', () => {
  it('returns "500: Unknown indicator"', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'undefined indicator',
      municipality: 'no.5001',
      data: 1,
      dataseries: 'dataseries',
      year: 2020,
      isDummy: true,
      token,
    });

    expect(response.status).equal(500);
    expect(response.body.message).have.string('Unknown indicator');
  });
});

describe('Insertion test with invalid municipality name', () => {
  it('returns status 200 and empty body', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: ICT: 1C',
      municipality: 'undefined',
      data: 1,
      dataseries: 'dataseries',
      year: 2020,
      isDummy: true,
      token,
    });

    expect(response.status).equal(200);
    expect(response.body).not.eq({});
  });
});

describe('Insertion test without token', () => {
  it('returns "500: Missing auth token"', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: ICT: 1C',
      municipality: 'no.5001',
      data: 1,
      dataseries: 'dataseries',
      year: 2020,
      isDummy: true,
    });

    expect(response.status).equal(500);
    expect(response.body.message).have.string('Missing auth token');
  });
});

describe('Insertion test wit invalid user', () => {
  it('returns "500: Server could not verify token"', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: ICT: 1C',
      municipality: 'no.5001',
      data: 1,
      dataseries: 'dataseries',
      year: 2020,
      isDummy: true,
      token: '123',
    });

    expect(response.status).equal(500);
    expect(response.body.message).have.string('Server could not verify token.');
  });
});
