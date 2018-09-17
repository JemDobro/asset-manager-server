'use strict';

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema ({
  type: { type: String, required: true },  
  model: { type: String, required: true }, 
  version: String,  
  quantity: { type: Number, required: true, default: 0 }, 
  startDate: { type: Date, required: true }, 
  endDate: {type: Date, required: true },
  status: {type: String, default: "Pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

requestSchema.set('timestamps', true);

requestSchema.set('toObject', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.createdAt;
    delete result.updatedAt;
  }
});

module.exports = mongoose.model('Request', requestSchema);