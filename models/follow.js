'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
  user: {
    type: Schema.ObjectId, ref: 'User'
  },
  followed: {
    type: Schema.ObjectId, ref: 'User'
  }
});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;
