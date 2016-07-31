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

mongoose.connect(process.env.MONGO_URI || process.env.MONGOLAB_URI);

// internal middleware
app.use(middleware());

// api router
app.use('/api', api());

app.use('/', function(req, res) {
  res.json("Server Active");
});

app.server.listen(process.env.PORT || 8080);

console.log(`Started on port ${app.server.address().port}`);