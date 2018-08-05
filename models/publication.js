'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const publicationSchema = new Schema({
  text: {
    type: String
  },
  file: {
    type: String
  },
  user: {
    type: Schema.ObjectId, ref: 'User'
  }
}, {
  timestamps: true
});

const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
