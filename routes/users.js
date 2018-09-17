'use strict';
const express = require('express');

const User = require('../models/user');
const router = express.Router();

/*===========POST/CREATE A USER==============*/
router.post('/', (req, res, next) => {
  /*====Never trust users - validate input====*/
  const requiredFields = ['firstName', 'lastName', 'username', 'badgeId', 'email', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['firstName', 'lastName', 'username', 'badgeId', 'email', 'password'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`Field: '${nonStringField}' must be type String`);
    err.status = 422;
    return next(err);
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(`Field: '${nonTrimmedField} cannot start or end with whitespace`);
    err.status = 422;
    return next(err);
  }

  const sizedFields = {
    firstName: {
      min: 1
    },
    lastName: {
      min: 1
    },
    username: {
      min: 1
    },
    badgeId: {
      min: 1
    },
    email: {
      min: 6
    },
    password: {
      min: 6,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );
  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooLargeField}' must be at most ${max} characters long`);
    err.status = 422;
    return next(err);
  }

  let { firstName, lastName, username, badgeId, email, password } = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();
  badgeId = badgeId.trim();
  email = email.trim();

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        firstName,
        lastName,
        username,
        badgeId,
        email,
        password: digest
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201)
        .location(`/api/users/${result.id}`)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;