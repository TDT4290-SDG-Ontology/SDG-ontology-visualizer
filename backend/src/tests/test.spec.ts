import request from 'supertest';
import app from '../index';
import { expect } from 'chai';

const agent = request.agent(app);

before((done) => {
  app.on('serverStarted', () => {
    done();
  });
});

describe('GET /isAlive', () => {
  it('should return "true"', async () => {
    const response = await agent.get('/api/isAlive');
    expect(response.statusCode).to.eq(200)
    expect(response.text).to.eq('true')
  });
});

describe('Login test with invalid user', () => {
  it('should return "400: Bad Request"', async () => {
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
  it('should return a token', async () => {
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
  it('should return status 200', async () => {
    const response = await agent.post('/api/data/insert').send({
      indicator: 'EC: ICT: ICT: 1C',
      municipality: 'Trondheim',
      data: '1',
      dataseries: 'dataseries',
      year: '2020',
      isDummy: true,
      token: token,
    });
    console.log(response.text)
    expect(response.status).equal(200);
  });

  it('should return status 500 on unkown/invalid indicator"', async () => {
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
