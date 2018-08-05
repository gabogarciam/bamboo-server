'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  emmiter: {
    type: Schema.ObjectId, ref: 'User'
  },
  reciber: {
    type: Schema.ObjectId, ref: 'User'
  },
  text: {
    type: String
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
