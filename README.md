# SQLMongoose

[![npm version](https://img.shields.io/npm/v/sqlmongoose.svg?style=flat-square)](https://www.npmjs.org/package/sqlmongoose)
[![npm downloads](https://img.shields.io/npm/dm/sqlmongoose.svg?style=flat-square)](http://npm-stat.com/charts.html?package=sqlmongoose)
[![License](https://img.shields.io/github/license/Jersuxs/SQLMongoose?style=flat-square)](https://github.com/Jersuxs/SQLMongoose/blob/main/LICENSE)

**SQLMongoose** is a powerful, modern, and easy-to-use ORM for SQLite3, inspired by Mongoose. It's designed to be intuitive for beginners and powerful for advanced users. It provides a simple and elegant way to interact with your SQLite database.

## Features

- **Easy to use:** A simple and intuitive API that feels familiar.
- **Powerful Query Builder:** Chainable query builder for complex queries.
- **Schema Validation:** Define schemas for your models and validate your data.
- **Hooks:** Execute middleware functions before or after operations.
- **TypeScript Support:** First-class TypeScript support out of the box.

## Installation

```bash
npm install sqlmongoose
```

## Quick Start

Here's a quick example to get you started:

```typescript
import { sqlmongoose, Schema, DataTypes } from 'sqlmongoose';

// 1. Connect to the database
await sqlmongoose.connect(':memory:');

// 2. Define a schema
const userSchema = new Schema({
  name: { type: DataTypes.STRING, required: true },
  email: { type: DataTypes.STRING, unique: true },
  age: { type: DataTypes.NUMBER, default: 0 },
});

// 3. Define a model
const User = sqlmongoose.define('User', userSchema);

// 4. Create a new user
const user = await User.create({
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
});

console.log('User created:', user);

// 5. Find users
const users = await User.find().where('age', '>', 25).execute();

console.log('Users older than 25:', users);
```

## Documentation

For more detailed information and advanced usage, please check out the [documentation](./docs/README.md).

## Examples

You can find more examples in the [examples](./examples) directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)