'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { MONGODB_URI } = require('./config');

function dbConnect(url = MONGODB_URI) {
  return mongoose.connect(url)
    .catch(err => {
      console.error('Mongoose failed to connect');
      console.error(err);
    });
}

function dbDisconnect() {
  return mongoose.disconnect();
}

function dbGet() {  //what is this, and what does it do?  Currently not imported anywhere
  return mongoose;
}

module.exports = {
  dbConnect,
  dbDisconnect,
  dbGet
};
