const { Schema } = require('sqlmongoose');

const economySchema = new Schema({
  userId: {
    type: 'STRING',
    required: true,
    unique: true
  },
  wallet: {
    type: 'NUMBER',
    default: 0,
    validate: value => value >= 0
  },
  bank: {
    type: 'NUMBER',
    default: 0,
    validate: value => value >= 0
  },
  inventory: {
    type: 'STRING',
    default: JSON.stringify({
      items: [],
      lastUpdated: new Date()
    })
  },
  stats: {
    type: 'STRING',
    default: JSON.stringify({
      workStreak: 0,
      robberySuccess: 0,
      robberyFail: 0,
      itemsCrafted: 0,
      itemsSold: 0
    })
  },
  cooldowns: {
    type: 'STRING',
    default: JSON.stringify({
      work: null,
      daily: null,
      rob: null,
      weekly: null
    })
  }
});

// JSON conversion hooks
economySchema.pre('save', async function(data) {
  const jsonFields = ['inventory', 'stats', 'cooldowns'];
  for (const field of jsonFields) {
    if (typeof data[field] === 'object') {
      data[field] = JSON.stringify(data[field]);
    }
  }
});

economySchema.post('save', async function(data) {
  const jsonFields = ['inventory', 'stats', 'cooldowns'];
  for (const field of jsonFields) {
    if (typeof data[field] === 'string') {
      data[field] = JSON.parse(data[field]);
    }
  }
});

module.exports = economySchema;
