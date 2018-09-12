'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  badgeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }
});

userSchema.set('toObject', {
  virtuals: true,
  transform: (doc, result) => {
    delete result.password;
  }
});

module.exports = mongoose.model('User', userSchema);