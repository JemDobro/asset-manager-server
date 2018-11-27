'use strict';
require('dotenv').config();//I think I should be able to move this to config.js if I want to just like it is
const express = require('express');
// const mongoose = require ('mongoose'); //I think this is not needed here due to existence of db-mongoose.js
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

const requestsRouter = require('./routes/requests');
const assetsRouter = require('./routes/assets');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();

// app.use(
//   cors()
// );

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
  skip: () => process.env.NODE_ENV === 'test'
}));

app.use(express.json());

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

app.use('/api/requests/', jwtAuth, requestsRouter);
app.use('/api/assets/', jwtAuth, assetsRouter);
app.use('/api/users/', usersRouter);
app.use('/api', authRouter);

app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status =  404;
  next(err);
});

app.use((err, req, res) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
    if (err.name !== 'FakeError') { console.log(err); }
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
