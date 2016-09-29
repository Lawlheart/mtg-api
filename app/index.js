import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import session from 'express-session';
import middleware from './middleware';
import api from './routes';
try { require('dotenv').load() } catch(Error) {}

var app = express();
app.server = http.createServer(app);

// 3rd party middleware
app.use(cors({
  exposedHeaders: ['Link']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET || 'BEFCD34CE8DC7A395A8A62459FC86',
  resave: false,
  saveUninitialized: true
}));

let db = process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI;
mongoose.connect(db);

// internal middleware
app.use(middleware());

// api router
app.use('/api', api());

app.use('/', function(req, res) {
  res.json("Server Active");
});

app.server.listen(process.env.PORT || 8081);

console.log(`Started on port ${app.server.address().port}`);

export default app;