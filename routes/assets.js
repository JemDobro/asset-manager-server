'use strict';
const express = require('express');
// const mongoose = require('mongoose');

const Asset = require('../models/asset');
const router = express.Router();

router.post('/', (req, res, next) => {
  const { type, model, version, owner, status, requestId } =req.body;
  const userId = req.user.id;

  const requiredFields = ['type', 'model', 'status'];
  const missingField = requiredFields.find(field => !(field in req.body)); 
  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }
  const newAsset = { type, model, version, owner, status, requestId, userId };
  Asset.create(newAsset)
    .then(result => {
      return res.status(201)
        .location(`${req.originalUrl}/${result.id}`)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;