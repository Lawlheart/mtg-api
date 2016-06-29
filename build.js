require("babel-core/register");
try { require('dotenv').load() } catch(Error) {}
require('./app/api/card/card.db.build');
require('./app/api/block/block.db.build');