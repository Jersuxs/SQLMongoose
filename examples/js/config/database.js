const { sqlmongoose } = require('sqlmongoose');

async function connectDatabase() {
  try {
    await sqlmongoose.connect('database.db');
    console.log('Connected to database successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

module.exports = connectDatabase;
