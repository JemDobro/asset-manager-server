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
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});

userSchema.methods.validatePassword = function(password) { //returns a promise, which resolves with a boolean value indicating whether or not the password is valid
  const currentUser = this;
  return bcrypt.compare(password, currentUser.password);  //bcrypt.compare should return true or false
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);