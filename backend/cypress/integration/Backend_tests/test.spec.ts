import request from 'supertest';
import app from '../../../src/index';
import { assert, expect } from 'chai';

const agent = request.agent(app);

before((done) => {
  app.on('serverStarted', () => {
    done();
  });
});

describe('Test if anyone answers', () => {
  it('GET', async () => {
    await agent.get('/api/ontologies/search?search=water').expect(200);
  });
});

describe('Login test with invalid user', () => {
  it('POST', async () => {
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
describe('Login test with valid user', () => {
  it('POST', async () => {
    const response = await agent.post('/api/auth/login').send({
      username: 'test',
      password: '123',
    });

    assert(response.statusCode === 200);
    assert(response.body);
    expect(response.body).have.property('token');
    token = response.body.token;
  });
});

describe('Insertion test with valid values', () => {
  it('POST', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: ICT: 1C',
      municipality: 'Trondheim',
      data: '1',
      dataseries: 'dataseries',
      year: '2020',
      isDummy: true,
      token: token,
    });
    expect(response.status).equal(200);
  });
});

describe('Insertion test with invalid values', () => {
  it('POST', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: 1C',
      municipality: 'Trondheim',
      data: '1',
      dataseries: 'dataseries',
      year: '2020',
      isDummy: true,
      token: token,
    });

    expect(response.status).equal(500);
    expect(response.body.message).have.string('Unknown indicator');
  });
});
