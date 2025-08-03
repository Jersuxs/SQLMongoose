const { Schema } = require('sqlmongoose');

const userSchema = new Schema({
  username: {
    type: 'STRING',
    required: true,
    unique: true,
    validate: value => value.length >= 3
  },
  email: {
    type: 'STRING',
    required: true,
    unique: true,
    validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  balance: {
    type: 'NUMBER',
    default: 1000
  },
  isActive: {
    type: 'BOOLEAN',
    default: true
  },
  createdAt: {
    type: 'DATE',
    default: () => new Date()
  }
});

module.exports = userSchema;
