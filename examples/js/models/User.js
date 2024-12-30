const { sqlmongoose } = require('sqlmongoose');
const userSchema = require('../schemas/UserSchema');

// Export functions that create and use the model
async function createUser(userData) {
  const User = sqlmongoose.define('User', userSchema);
  return await User.create(userData);
}

async function findUsers(query = {}) {
  const User = sqlmongoose.define('User', userSchema);
  return await User.find(query);
}

async function updateUser(query, update) {
  const User = sqlmongoose.define('User', userSchema);
  return await User.update(query, update);
}

module.exports = {
  createUser,
  findUsers,
  updateUser
};
