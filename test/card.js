try { require('dotenv').load() } catch(Error) {}

process.env.NODE_ENV = 'test';

import Card from '../app/api/card/card.model';
import testSet from '../data/KLD.json';
let testCards = testSet.cards;

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


describe('Cards', () => {
  beforeEach(done => {
    Card.remove({}, err => {
      done();
    });
  });

  describe('/GET cards', () => {
    it('should GET all the cards', (done) => {
      chai.request(server).get('/api/cards').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });

    it('should get the right card when given a multiverse id', (done) => {
      let card = testCards[0];
      chai.request(server).post('/api/cards').send(card).end((err, res) => {
        chai.request(server).get('/api/cards/' + card.multiverseid).end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.multiverseid.should.equal(card.multiverseid);
          res.body._id.should.equal(card.multiverseid);
          done();
        });
      });
    });

    it('should get multiple cards when given multiple ids separated by a | character', (done) => {
      let card1 = testCards[0];
      let card2 = testCards[1];
      chai.request(server).post('/api/cards').send(card1).end((err, res) => {
        chai.request(server).post('/api/cards').send(card2).end((err, res) => {
          chai.request(server).get('/api/cards/' + card1.multiverseid + "|" + card2.multiverseid).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.equal(2);
            res.body[0].multiverseid.should.equal(card1.multiverseid);
            res.body[1].multiverseid.should.equal(card2.multiverseid);
            done();
          });
        });
      });
    });

    it('should return an error when searching for a card that doesn\'t exist', (done) => {
      chai.request(server).get('/api/cards/777777777').end((err, res) => {
        res.should.have.status(404);
        err.message.should.equal('Not Found');
        done();
      });
    });
  });

  describe('/POST card', () => {
    it('should post new cards properly', (done) => {
      let card = testCards[0];
      chai.request(server).post('/api/cards').send(card).end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.multiverseid.should.equal(card.multiverseid);
        res.body._id.should.equal(card.multiverseid);
        done();
      });
    });

    it('should return an error if the card already exists', (done) => {
      let card = testCards[0];
      chai.request(server).post('/api/cards').send(card).end((err, res) => {
        chai.request(server).post('/api/cards').send(card).end((err, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.equal('card already exists');
          done();
        });
      });
    });

    it('should return an error if basic card properties aren\'t defined', (done) => {
      let card = {"hello": "world!"};
      chai.request(server).post('/api/cards').send(card).end((err, res) => {
        res.should.have.status(500);
        done();
      });
    });
  });

  describe('/DELETE card', () => {
    it('should delete a card, given a multiverseid', (done) => {
      let card = testCards[0];
      chai.request(server).post('/api/cards').send(card).end((err, res) => {
        res.should.have.status(201);
        chai.request(server).delete('/api/cards/' + card.multiverseid).end((err, res) => {
          res.should.have.status(204);
          done();
        });
      });
    });

    it('should throw a 404 error if the card doesn\'t exist', (done) => {
      chai.request(server).delete('/api/cards/77777777777').end((err, res) => {
        res.should.have.status(404);
        err.message.should.equal('Not Found');
        done();
      });
    });
  });

  describe('/PUT card', () => {
    it('should update a card if all properties are correct', (done) => {
      let card = testCards[55];
      chai.request(server).post('/api/cards').send(card).end((err, req) => {
        req.body.text.should.equal(card.text);
        card.text = "Awesomesauce";
        chai.request(server).put('/api/cards/' + card.multiverseid).send(card).end((err, req) => {
          req.body.text.should.equal("Awesomesauce");
          done();
        });
      });
    });
  });

  describe('/SEARCH card', () => {
    it('returns an object with search data', (done) => {
      chai.request(server).get('/api/cards/search?search=kiora').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('results');
        res.body.should.have.property('totalCount');
        done();
      });
    });
    it('returns an object that includes relevant cards', (done) => {
      let card = testCards[55];
      let query = card.name.split().join("+")
      console.log(query);
      chai.request(server).post('/api/cards').send(card).end((err, res) => {
        chai.request(server).get('/api/cards/search?search=' + query).end((err, res) => {
          res.body.results.length.should.equal(1);
          res.body.results[0].name.should.equal(card.name);
          res.body.totalCount.should.equal(1);
          done();
        });
      });
    });
  });
});