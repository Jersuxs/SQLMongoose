const { sqlmongoose } = require('sqlmongoose');
const userSchema = require('./schemas/UserSchema');

async function main() {
  try {
    // First connect to the database
    await sqlmongoose.connect('database.db');
    console.log('Connected to database successfully!');

    // Now define the model after connection is established
    const User = sqlmongoose.define('User', userSchema);

    // Create a new user
    const user = await User.create({
      username: 'john_doe',
      email: 'john@example.com'
    });
    console.log('Created user:', user);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection when done
    await sqlmongoose.close();
  }
}

// Run the main function
main().catch(console.error);
