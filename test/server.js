import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';
import {it, describe, beforeEach} from "mocha";
let should = chai.should();

chai.use(chaiHttp);

describe('Basic Configuration', () => {
  it('should give the basic message for the root route', (done) => {
    chai.request(server).get('/').end((err, res) => {
      res.should.have.status(200);
      res.body.should.equal('Server Active');
      done();
    });
  });
  it('should give version number at /api', (done) => {
    chai.request(server).get('/api').end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('version');
      done();
    });
  });
});
