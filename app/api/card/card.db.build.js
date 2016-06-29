'use strict';
/*
  This file is used to load database from a json file from http://mtgjson.com/
  It is not loaded into the server directly, it is run from the command line.
*/
require("babel-core/register");
var fs = require('fs');
import mongoose from 'mongoose';
var sets = require('../../../data/allSets.json');
import Card from './card.model';

mongoose.connect(process.env.MONGO_URI);

function create(card, callback) {
  try {
    Card.create(card, function (err, card) {
      callback();
    });
  } catch (e) {
    Card.update(card, function (err, card) {
      callback();
    });
  }
}

function build(sets) {
  let completed = 0;
  for (let setname in sets) {
    if (sets.hasOwnProperty(setname)) {
      console.log("building " + sets[setname].name);
      let cardSet = sets[setname].cards;
      for (let i = 0; i < cardSet.length; i++) {
        let card = cardSet[i];
        if (card.hasOwnProperty('multiverseid')) {
          card._id = card.multiverseid;
          create(card, function () {
            if (i === cardSet.length - 1) {
              // doesn't flag all of the builds, 155 of 193
              console.log("Finish Building " + completed + " of " + 155 + ": " + sets[setname].name);
              completed ++;
              if(completed === 155) {
                console.log("FINISH BUILD, exiting in 10 seconds");
                setTimeout(() => process.exit(), 10000);
              }
            }
          });
        }
      }
    }
  }
}

build(sets);