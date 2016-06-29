'use strict';
/*
 This file is used to load database from a json file from http://mtgjson.com/
 It is not loaded into the server directly, it is run from the command line.
 */
require("babel-core/register");
var fs = require('fs');
var sets = require('../../../data/allSets.json');
import Block from './block.model';

function create(block, callback) {
  try {
    Block.create(block,(err, block) => callback());
  } catch (e) {
    Block.update(block,(err, block) => callback());
  }
}

function build(sets) {
  let initialized = 0;
  let completed = 0;
  for(let setName in sets) {
    if(sets.hasOwnProperty(setName)) {
      initialized ++;
      console.log("building " + sets[setName].name);
      let set = sets[setName];
      set._id = set.code;
      create(set, function() {
        completed ++;
        console.log("Completed " + completed + " of " + initialized + ": " + sets[setName].name);
        if(completed === initialized) return;
      });
    }
  }
}
build(sets);