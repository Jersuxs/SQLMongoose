# Getting Started

This guide will walk you through the basics of using SQLMongoose.

## Installation

First, install the package from NPM:

```bash
npm install sqlmongoose
```

## Connecting to the Database

To connect to a database, use the `sqlmongoose.connect()` method. You can connect to a file-based database or an in-memory database.

```typescript
import { sqlmongoose } from 'sqlmongoose';

// Connect to a file-based database
await sqlmongoose.connect('path/to/your/database.db');

// Connect to an in-memory database
await sqlmongoose.connect(':memory:');
```

## Defining a Schema

A schema defines the structure of your data. You can define fields with types, validation, default values, and more.

```typescript
import { Schema, DataTypes } from 'sqlmongoose';

const userSchema = new Schema({
  name: { type: DataTypes.STRING, required: true },
  email: { type: DataTypes.STRING, unique: true },
  age: { type: DataTypes.NUMBER, default: 0 },
});
```

## Defining a Model

A model is a constructor compiled from a schema definition. An instance of a model is called a document. Models are responsible for creating and reading documents from the underlying database.

```typescript
const User = sqlmongoose.define('User', userSchema);
```

## Creating Documents

To create a new document, use the `create()` method on your model.

```typescript
const user = await User.create({
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
});
```

## Querying Documents

SQLMongoose provides a powerful query builder to help you find the data you're looking for.

```typescript
// Find all users
const allUsers = await User.find().execute();

// Find users older than 25
const users = await User.find().where('age', '>', 25).execute();

// Find a single user by email
const user = await User.findOne({ email: 'john.doe@example.com' });
```
