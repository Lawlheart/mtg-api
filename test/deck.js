import Deck from '../app/api/deck/deck.model';
import testDeck from '../data/simic.json';

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';
import {it, describe, beforeEach} from "mocha";
import _ from 'lodash';
let should = chai.should();

chai.use(chaiHttp);

describe('Decks', () => {
  beforeEach((done) => {
    Deck.remove({}, () => {
      done();
    });
  });

  describe('/GET Decks', () => {
    beforeEach((done) => {
      Deck.create(testDeck).then(data => {
        done();
      });
    });

    it('should get all of the decks at /', (done) => {
      chai.request(server).get('/api/decks').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.equal(1);
        done();
      });
    });

    it('should get a specific deck at its ID', (done) => {
      chai.request(server).get('/api/decks/' + testDeck._id).end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.name.should.equal('Simic');
        done();
      });
    });

    it('should return a 404 error if there is no deck at that ID', (done) => {
      chai.request(server).get('/api/decks/777777777777').end((err, res) => {
        res.should.have.status(404);
        err.message.should.equal('Not Found');
        done();
      });
    });
  });

  describe('/POST Deck', () => {
    it('creates a new deck properly', (done) => {
      chai.request(server).post('/api/decks').send(testDeck).end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.cards.should.be.a('array');
        res.body.name.should.equal(testDeck.name);
        done();
      });
    });

    it('should throw an error with bad data', (done) => {
      chai.request(server).post('/api/decks').send({"hello": "world!"}).end((err, res) => {
        res.should.have.status(500);
        done();
      });
    });
  });

  describe('/PUT Deck', () => {
    beforeEach((done) => {
      Deck.create(testDeck).then(() => {
        done();
      });
    });

    it('should update a deck properly', (done) => {
      let updatedDeck = _.clone(testDeck);
      updatedDeck.name = "Even Better Deck!";
      chai.request(server).put('/api/decks/' + updatedDeck._id).send(updatedDeck).end((err, res) => {
        res.body.name.should.equal("Even Better Deck!");
        done();
      });
    });
  });

  describe('/DELETE deck', () => {
    beforeEach((done) => {
      Deck.create(testDeck).then(() => {
        done();
      });
    });

    it('should delete a deck', (done) => {
      chai.request(server).delete('/api/decks/' + testDeck._id).end((err, res) => {
        res.should.have.status(204);
        done();
      });
    });

    it('should throw an error if the deck doesn\'t exist', (done) => {
      chai.request(server).delete('/api/decks/77777777777').end((err, res) => {
        res.should.have.status(500);
        done();
      });
    });
  });


});