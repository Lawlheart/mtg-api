'use strict';
/*
  This file is used to load database from a json file from http://mtgjson.com/
  It is not loaded into the server directly, it is run from the command line.
*/
require("babel-core/register");
var fs = require('fs');
var sets = require('../../../data/allSets.json');
import Card from './card.model';

function create(card, callback) {
  try {
    Card.create(card, (err, card) => callback());
  } catch (e) {
    Card.update(card, (err, card) => callback());
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
              // doesn't flag all of the builds, 160 of ?
              console.log("Finish Building " + completed + " of " + 160 + ": " + sets[setname].name);
              completed ++;
              if(completed === 160) {
                console.log("FINISH BUILD, exiting in 30 seconds");
                setTimeout(() => process.exit(), 30000);
              }
            }
          });
        }
      }
    }
  }
}

build(sets);