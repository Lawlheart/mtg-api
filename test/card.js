try { require('dotenv').load() } catch(Error) {}

process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import Card from '../app/api/card/card.model';
import testSet from '../data/KLD.json';
let testCards = testSet.cards;
console.log(testCards.length);

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';
import {it, describe, beforeEach} from "mocha";
let should = chai.should();

chai.use(chaiHttp);

describe('Cards', () => {
  beforeEach(done => {
    Card.remove({}, err => {
      done();
    });
  });

  describe('/GET cards', () => {
    it('should GET all the cards', (done) => {
      chai.request(server)
        .get('/api/cards')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
    it('should get the right card when given a multiverse id', (done) => {
      let card = testCards[0];
      chai.request(server)
        .post('/api/cards')
        .send(card)
        .end((err, res) => {
          chai.request(server)
            .get('/api/cards/' + card.multiverseid)
              .end((err, res) => {
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
      chai.request(server)
        .post('/api/cards')
        .send(card1)
        .end((err, res) => {
          chai.request(server)
            .post('/api/cards')
            .send(card2)
            .end((err, res) => {
              chai.request(server)
              .get('/api/cards/' + card1.multiverseid + "|" + card2.multiverseid)
              .end((err, res) => {
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
  });

  describe('/POST card', () => {
    it('should post new cards properly', (done) => {
      let card = testCards[0];
      chai.request(server)
        .post('/api/cards')
        .send(card)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.multiverseid.should.equal(card.multiverseid);
          res.body._id.should.equal(card.multiverseid);
          done();
        });
    });

    it('should return an error if the card already exists', (done) => {
      let card = testCards[0];
      chai.request(server)
        .post('/api/cards')
        .send(card)
        .end((err, res) => {
          chai.request(server)
            .post('/api/cards')
            .send(card)
            .end((err, res) => {
              res.should.have.status(403);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.equal('card already exists');
              done();
            });
        });
    });


  });
});