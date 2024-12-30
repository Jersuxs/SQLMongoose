# SQLite Schemas

A powerful and intuitive ORM for SQLite3 that brings Mongoose-like schemas and models to your SQLite database.
Support server: https://discord.gg/hzWuQH869R

## Features

- 🎯 Mongoose-like Schema definitions
- 🚀 Simple and intuitive Model API
- 📦 TypeScript support out of the box
- 🛡️ Type safety for your database operations
- 🔍 Familiar query interface (find, findOne)
- 🎨 Clean and modern API design
- 🔄 Pre/Post Hooks for save and update operations
- 🤝 Relationship support with populate
- ⚡ Advanced querying (gt, lt, like, in, etc.)
- 📊 Index support
- 🔒 Transaction support
- ✨ Field validation

## Installation

```bash
npm install sqlite-schemas
```

## Quick Start

```typescript
import { createConnection, Schema, Model } from 'sqlite-schemas';

// Create database connection
const db = createConnection('example.db');

// Define your schema
const userSchema = new Schema({
  name: { type: 'STRING', required: true },
  age: { type: 'NUMBER', required: true },
  active: { type: 'BOOLEAN', default: true },
  createdAt: { type: 'DATE', default: new Date() }
});

// Create a model
interface User {
  id?: number;
  name: string;
  age: number;
  active: boolean;
  createdAt: Date;
}

const UserModel = new Model<User>(db, 'users', userSchema);

// Usage examples
async function example() {
  // Create a new user
  const user = await UserModel.create({
    name: 'John Doe',
    age: 25,
    active: true,
    createdAt: new Date()
  });

  // Find all users
  const allUsers = await UserModel.find();

  // Find one user
  const john = await UserModel.findOne({ name: 'John Doe' });
}
```

## Schema Types

SQLite Schemas supports the following data types:
- `STRING` (stored as TEXT)
- `NUMBER` (stored as NUMERIC)
- `BOOLEAN` (stored as INTEGER)
- `DATE` (stored as TEXT)

## Schema Configuration

```typescript
interface SchemaField {
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE';
  required?: boolean;
  default?: any;
  validate?: (value: any) => boolean | Promise<boolean>;
  index?: boolean;
  unique?: boolean;
  ref?: string; // For relationships
}

// Example schema with all features
const userSchema = new Schema({
  name: { 
    type: 'STRING', 
    required: true,
    validate: (value) => value.length >= 2
  },
  email: { 
    type: 'STRING', 
    unique: true,
    index: true
  },
  age: { 
    type: 'NUMBER',
    validate: (value) => value >= 0
  },
  departmentId: { 
    type: 'NUMBER',
    ref: 'departments' // Relationship
  }
});
```

## Advanced Querying

```typescript
// Advanced query operators
const results = await UserModel.find({
  age: { gt: 18, lte: 65 },
  name: { like: 'John' },
  status: { in: ['active', 'pending'] }
}, {
  populate: ['departmentId'],
  limit: 10,
  offset: 0,
  orderBy: { 
    name: 'ASC',
    age: 'DESC'
  }
});

// Update operations
await UserModel.update(
  { age: { lt: 18 } },
  { status: 'underage' }
);

// Delete operations
await UserModel.delete({ status: 'inactive' });
```

## Hooks

```typescript
// Pre-save hook
userSchema.pre('save', async function(data) {
  data.createdAt = new Date();
  data.password = await hashPassword(data.password);
});

// Post-save hook
userSchema.post('save', async function(data) {
  await sendWelcomeEmail(data.email);
});

// Pre-update hook
userSchema.pre('update', async function(data) {
  data.updatedAt = new Date();
});
```

## Transactions

```typescript
const connection = createConnection('example.db');

await connection.transaction(async (db) => {
  const UserModel = new Model(db, 'users', userSchema);
  const OrderModel = new Model(db, 'orders', orderSchema);

  const user = await UserModel.create({ /* user data */ });
  const order = await OrderModel.create({ 
    userId: user.id,
    /* order data */ 
  });

  // If any operation fails, the entire transaction is rolled back
});
```

## Relationships and Population

```typescript
// Define related schemas
const departmentSchema = new Schema({
  name: { type: 'STRING', required: true }
});

const userSchema = new Schema({
  name: { type: 'STRING', required: true },
  departmentId: { type: 'NUMBER', ref: 'departments' }
});

// Query with population
const users = await UserModel.find(
  { age: { gt: 25 } },
  { populate: ['departmentId'] }
);
// Users will include full department objects
```

## Validation

```typescript
const productSchema = new Schema({
  name: { 
    type: 'STRING',
    required: true,
    validate: (value) => value.length >= 3
  },
  price: {
    type: 'NUMBER',
    validate: (value) => value > 0
  },
  sku: {
    type: 'STRING',
    unique: true,
    validate: (value) => /^[A-Z]{2}-\d{6}$/.test(value)
  }
});

// Validation runs automatically on create and update
try {
  await ProductModel.create({
    name: 'A', // Will throw validation error
    price: -10 // Will throw validation error
  });
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

## Indexing

```typescript
const userSchema = new Schema({
  email: { 
    type: 'STRING', 
    unique: true, // Creates unique index
    index: true   // Creates regular index
  },
  name: { 
    type: 'STRING',
    index: true   // Creates regular index
  }
});
```

## API Reference

### Schema

#### Constructor
```typescript
new Schema(definition: SchemaDefinition)
```

### Model

#### Constructor
```typescript
new Model<T>(db: Database, tableName: string, schema: Schema)
```

#### Methods

##### find
```typescript
find(query?: Partial<T>): Promise<T[]>
```

##### findOne
```typescript
findOne(query: Partial<T>): Promise<T | null>
```

##### create
```typescript
create(data: T): Promise<T>
```

## Examples

### Complete User Management Example

```typescript
import { createConnection, Schema, Model } from 'sqlite-schemas';

interface User {
  id?: number;
  name: string;
  email: string;
  age: number;
  active: boolean;
}

const db = createConnection('users.db');

const userSchema = new Schema({
  name: { type: 'STRING', required: true },
  email: { type: 'STRING', required: true },
  age: { type: 'NUMBER', required: true },
  active: { type: 'BOOLEAN', default: true }
});

const UserModel = new Model<User>(db, 'users', userSchema);

async function userExample() {
  // Create users
  await UserModel.create({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    active: true
  });

  // Find active users
  const activeUsers = await UserModel.find({ active: true });
  
  // Find specific user
  const john = await UserModel.findOne({ email: 'john@example.com' });
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
