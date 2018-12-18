'use strict';
const express = require('express');
const mongoose = require('mongoose');

const Request = require('../models/request');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  let filter = { userId };

  Request.find(filter)
    .sort({ end : 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Request.findOne({ _id: id, userId })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  /*====Never trust users - validate input====*/
  const requiredFields = ['type', 'model', 'quantity', 'start', 'end'];
  const missingField = requiredFields.find(field => !(field in req.body)); 
  if (missingField) {
    const err = new Error(`This is a required field -- please enter a value. Thanks!`);
    err.status = 422;
    err.location = `${missingField}`;
    err.reason = 'ValidationError';
    return next(err);
  }
  
  const stringFields = ['type', 'model', 'version'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`'${nonStringField}' must be type String`);
    err.status = 422;
    err.location = `${nonStringField}`;
    err.reason = 'ValidationError';
    return next(err);
  }
  
  let { type, model, version, quantity, start, end } = req.body;
  const userId = req.user.id;
  type = type.trim();
  model = model.trim();
  version = version.trim();
  quantity = quantity.trim();
  start = start.trim();
  end = end.trim();

  const newRequest = { type, model, version, quantity, start, end, userId }; 
  Request.create(newRequest)
    .then(result => {
      return res.status(201)
        .location(`/api/requests/${result.id}`)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PATCH/UPDATE A SINGLE ITEM/particular fields ========== */
router.patch('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const toUpdate = {};
  const updateableFields = ['type', 'model', 'version', 'quantity', 'start', 'end', 'status'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Request.findByIdAndUpdate({ _id: id, userId }, toUpdate, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM by including all fields ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const toUpdate = {};
  const updateableFields = ['type', 'model', 'version', 'quantity', 'start', 'end', 'status'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const requiredFields = ['type', 'model', 'quantity', 'start', 'end'];
  const missingField = requiredFields.find(field => !(field in req.body)); 
  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  Request.findByIdAndUpdate({ _id: id, userId }, toUpdate, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Request.findOneAndRemove({ _id: id, userId })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
