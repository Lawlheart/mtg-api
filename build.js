require("babel-core/register");
var mongoose = require('mongoose');
try { require('dotenv').load() } catch(Error) {}

mongoose.connect(process.env.MONGO_URI);

require('./app/api/card/card.db.build');
require('./app/api/block/block.db.build');