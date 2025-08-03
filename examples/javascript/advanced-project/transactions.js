const { sqlmongoose } = require('sqlmongoose');
const { UserModel } = require('./models/User');

async function transferMoney(fromUserId, toUserId, amount) {
  return await sqlmongoose.transaction(async () => {
    // Get both users
    const [fromUser, toUser] = await Promise.all([
      UserModel.findOne({ id: fromUserId }),
      UserModel.findOne({ id: toUserId })
    ]);

    // Validate users and balance
    if (!fromUser || !toUser) {
      throw new Error('One or both users not found');
    }
    if (fromUser.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Perform the transfer
    await Promise.all([
      UserModel.update(
        { id: fromUserId },
        { $inc: { balance: -amount } }
      ),
      UserModel.update(
        { id: toUserId },
        { $inc: { balance: amount } }
      )
    ]);

    return {
      from: fromUser.username,
      to: toUser.username,
      amount
    };
  });
}

module.exports = {
  transferMoney
};
