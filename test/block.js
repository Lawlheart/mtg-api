process.env.NODE_ENV = 'test';

import Block from '../app/api/block/block.model';
import testBlock from '../data/KLD.json';

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';
import {it, describe, beforeEach} from "mocha";
import _ from 'lodash';
let should = chai.should();

chai.use(chaiHttp);

describe('Blocks', () => {
  beforeEach((done) => {
    Block.remove({}, () => {
      done();
    });
  });

  describe('/GET Blocks', () => {
    it('should get all the blocks', (done) => {
      chai.request(server).get('/api/blocks').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.equal(0);
        done();
      });
    });

    it('should return the correct block', (done) => {
      testBlock._id = testBlock.code;
      Block.create(testBlock).then((data) => {
        chai.request(server).get('/api/blocks/' + testBlock.code).end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.name.should.equal('Kaladesh');
          done();
        });
      });

    });

    it('should return an error when searching for a block that doesn\'t exist', (done) => {
      chai.request(server).get('/api/blocks/ERR').end((err, res) => {
        res.should.have.status(404);
        err.message.should.equal('Not Found');
        done();
      });
    });
  });

  describe('/POST Block', () => {
    // full blocks are actually too big to put over post, so I'll just be testing a small block
    let shortBlock;
    beforeEach((done) => {
      shortBlock = _.clone(testBlock);
      shortBlock._id = shortBlock.code;
      shortBlock.cards = shortBlock.cards.slice(0, 10);
      done();
    });

    it('should create a new block with good data', (done) => {
      chai.request(server).post('/api/blocks').send(shortBlock).end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body._id.should.equal(shortBlock.code);
        res.body.code.should.equal(shortBlock.code);
        res.body.cards.length.should.equal(10);
        done();
      });
    });

    it('should throw an error if a block with that id already exists', (done) => {
      Block.create(testBlock).then((data) => {
        chai.request(server).post('/api/blocks').send(shortBlock).end((err, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.equal('block already exists');
          done();
        });
      });
    });

    it('should throw an error with bad data', (done) => {
      let badBlock = {"_id":"DUD", "hello": "world!"};
      chai.request(server).post('/api/blocks').send(badBlock).end((err, res) => {
        res.should.have.status(500);
        done();
      });
    });
  });

  describe('/PUT Block', () => {
    // full blocks are actually too big to put over post, so I'll just be testing a small block
    let shortBlock;
    beforeEach((done) => {
      shortBlock = _.clone(testBlock);
      shortBlock._id = shortBlock.code;
      shortBlock.cards = shortBlock.cards.slice(0, 10);
      Block.create(shortBlock).then((data) => {
        done();
      });
    });

    it('should update block properties', (done) => {
      let updatedBlock = _.clone(shortBlock);
      updatedBlock.name = "New Name";
      chai.request(server).put('/api/blocks/' + shortBlock.code).send(updatedBlock).end((err, res) => {
        res.should.have.status(200);
        res.body.name.should.equal("New Name");
        done();
      });
    });
  });

  describe('/DELETE Block', () => {
    beforeEach((done) => {
      Block.create(testBlock).then((data) => {
        done();
      });
    });

    it('should delete the block, if it exists', (done) => {
      chai.request(server).delete('/api/blocks/' + testBlock.code).end((err, res) => {
        res.should.have.status(204);
        done();
      });
    });

    it('should return a 404 error if the block doesn\'t exist', (done) => {
      chai.request(server).delete('/api/blocks/ERR').end((err, res) => {
        res.should.have.status(404);
        err.message.should.equal('Not Found');
        done();
      });
    });

  });
});