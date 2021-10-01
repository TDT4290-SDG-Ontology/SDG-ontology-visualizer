import deleteDataPoint from "../../../src/database/deleteDataPoint";
import getDataSeries from "../../../src/database/getDataSeries";

describe('Run backend', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3001')
    });
});

describe('Login test with invalid user', () => {
    it('POST', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/auth/login',
            failOnStatusCode: false,
            body: {
                "username": "test1",
                "password": "1234"
            }
        }).then((response) => {
            //expect(response.status).equal(500)
            expect(response.body.message).have.string('Invalid')
        });
    });
});

let token = '';
const value = 6;
describe('Login test with valid user', () => {
    it('POST', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/auth/login',
            body: {
                "username": "test",
                "password": "123"
            }
        }).then((response) => {
            expect(response.status).equal(200)
            expect(response.body).have.property('token')
            token = response.body.token;
        });
    });
});

describe('Insertion test with valid values', () => {
    it('POST', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/data/insert',
            body: {
                "indicator": "EC: ICT: ICT: 1C",
                "municipality": "no.5001",
                "data": 1,
                "year": "2020",
                "isDummy": true,
                "token": token
            }
        }).then((response) => {
            expect(response.status).equal(200)
        });
    });
});

describe('Insertion test with valid values without dataseries defined in the insert query, then test get data series with the value inserted', () => {
    it('POST', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/data/insert',
            body: {"indicator": "EC: ICT: ICT: 1C",
                "municipality": "no.5001",
                "data": value,
                "year": "2020",
                "isDummy": true,
                "token": token
            }
        }).then((response) => {
            expect(response.status).equal(200)
            cy.request({
                method: 'POST',
                url: 'http://localhost:3001/api/data/get',
                body: {
                    "indicator": "EC: ICT: ICT: 1C",
                    "municipality": "no.5001",
                    "year": "2020"
                }
            }).then((response) => {
                expect(response.status).equal(200);
                expect(response.body).to.not.be.empty;
                expect(response.body[0]).have.property('value');
                expect(response.body[0].value).equal(value);
            })
        });
    });
});

describe('Insertion test with invalid indicator', () => {
    it('POST', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/data/insert',
            failOnStatusCode: false,
            body: {"indicator": "undefined indicator",
                "municipality": "no.5001",
                "data": "1",
                "dataseries": "dataseries",
                "year": "2020",
                "isDummy": true,
                "token": token
            }
        }).then((response) => {
            expect(response.status).equal(500)
            expect(response.body.message).have.string('Unknown indicator')
        });
    });
})

describe('Insertion test with invalid municipality name', () => {
    it('POST', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/data/insert',
            failOnStatusCode: false,
            body: {"indicator": "EC: ICT: ICT: 1C",
                "municipality": "undefined",
                "data": "1",
                "dataseries": "dataseries",
                "year": "2020",
                "isDummy": true,
                "token": token
            }
        }).then((response) => {
            expect(response.status).equal(200)
            expect(response.body).to.be.empty
        });
    });
})

describe('Insertion test without token', () => {
    it('POST', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/data/insert',
            failOnStatusCode: false,
            body: {"indicator": "EC: ICT: ICT: 1C",
                "municipality": "no.5001",
                "data": "1",
                "dataseries": "dataseries",
                "year": "2020",
                "isDummy": true
            }
        }).then((response) => {
            expect(response.status).equal(500)
            expect(response.body.message).have.string('Missing auth token')
        });
    });
})

describe('Insertion test with invalid user', () => {
    it('POST', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/data/insert',
            failOnStatusCode: false,
            body: {"indicator": "EC: ICT: ICT: 1C",
                "municipality": "no.5001",
                "data": "1",
                "dataseries": "dataseries",
                "year": "2020",
                "isDummy": true,
                "token": "123"
            }
        }).then((response) => {
            expect(response.status).equal(500)
            expect(response.body.message).have.string('Server could not verify token.')
        });
    });
})
