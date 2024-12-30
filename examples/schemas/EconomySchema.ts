import sqlmongoose, { Schema } from 'sqlmongoose';

const economySchema = new Schema({
  userId: {
    type: 'STRING',
    required: true,
    unique: true
  },
  money: {
    type: 'NUMBER',
    default: 0
  },
  bank: {
    type: 'NUMBER',
    default: 0
  },
  lastWork: {
    type: 'DATE',
    default: null
  },
  caracruz: {
    type: 'STRING',
    default: JSON.stringify({
      wins: 0,
      losses: 0,
      totalBet: 0
    })
  }
});

export const Economy = sqlmongoose.model('Economy', economySchema);
export default Economy;

