# SQLMongoose

A SQLite ORM that works exactly like Mongoose, bringing the familiar MongoDB/Mongoose syntax to SQLite.
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
npm install sqlmongoose
```

## Quick Start

```javascript
const sqlmongoose = require('sqlmongoose');

// Connect to database
await sqlmongoose.connect('database.db');

// Define Schema
const userSchema = new Schema({
  name: { type: 'STRING', required: true },
  email: { type: 'STRING', unique: true },
  balance: { type: 'NUMBER', default: 0 },
  isActive: { type: 'BOOLEAN', default: true },
  lastLogin: { type: 'DATE' }
});

// Create Model
const User = sqlmongoose.model('User', userSchema);

// Use it like Mongoose!
const user = await User.create({
  name: 'John',
  email: 'john@example.com'
});
```

## Defining Schemas

```javascript
const economySchema = new Schema({
  userId: {
    type: 'STRING',
    required: true,
    unique: true
  },
  money: {
    type: 'NUMBER',
    default: 0,
    validate: value => value >= 0
  },
  inventory: {
    type: 'STRING', // Stored as JSON
    default: JSON.stringify({
      items: [],
      lastUpdated: new Date()
    })
  }
});

// Pre-save hook example
economySchema.pre('save', async function(data) {
  if (typeof data.inventory === 'object') {
    data.inventory = JSON.stringify(data.inventory);
  }
});

// Post-save hook example
economySchema.post('save', async function(data) {
  if (typeof data.inventory === 'string') {
    data.inventory = JSON.parse(data.inventory);
  }
});

// Create and export model
const Economy = sqlmongoose.model('Economy', economySchema);
module.exports = Economy;
```

## Using Models

### Creating Documents
```javascript
// In your command file
const Economy = sqlmongoose.model('Economy');

async function createUser(userId) {
  const economy = await Economy.create({
    userId: userId,
    money: 1000 // Starting balance
  });
  return economy;
}
```

### Finding Documents
```javascript
// Find one
const user = await Economy.findOne({ userId: '123' });

// Find many with conditions
const richUsers = await Economy.find({
  money: { gt: 10000 }
}, {
  limit: 10,
  orderBy: { money: 'DESC' }
});

// Advanced queries
const users = await Economy.find({
  money: { gt: 1000, lte: 5000 },
  lastLogin: { gt: new Date('2024-01-01') },
  name: { like: 'John' }
});
```

### Updating Documents
```javascript
// Regular update
await Economy.update(
  { userId: '123' },
  { money: 5000 }
);

// Using operators like Mongoose
await Economy.update(
  { userId: '123' },
  { $inc: { money: 100 } }
);

// Multiple operators
await Economy.update(
  { userId: '123' },
  {
    $inc: { money: -50 },
    $set: { lastTransaction: new Date() }
  }
);
```

### Using in Discord.js Commands
```javascript
const { SlashCommandBuilder } = require('discord.js');
const Economy = require('../schemas/EconomySchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance'),

  async execute(interaction) {
    let user = await Economy.findOne({ 
      userId: interaction.user.id 
    });

    if (!user) {
      user = await Economy.create({
        userId: interaction.user.id,
        money: 1000, // Starting money
        bank: 0
      });
    }

    await interaction.reply(
      `Balance: ${user.money}\nBank: ${user.bank}`
    );
  }
};
```

## Transactions
```javascript
const sqlmongoose = require('sqlmongoose');

async function transferMoney(fromId, toId, amount) {
  await sqlmongoose.transaction(async () => {
    const [from, to] = await Promise.all([
      Economy.findOne({ userId: fromId }),
      Economy.findOne({ userId: toId })
    ]);

    if (from.money < amount) {
      throw new Error('Insufficient funds');
    }

    await Economy.update(
      { userId: fromId },
      { $inc: { money: -amount } }
    );

    await Economy.update(
      { userId: toId },
      { $inc: { money: amount } }
    );
  });
}
```

## Update Operators

SQLMongoose supports these MongoDB-like operators:

```javascript
// $inc - Increment/decrement
await Economy.update(
  { userId },
  { $inc: { money: 100, xp: 50 } }
);

// $set - Set values
await Economy.update(
  { userId },
  { $set: { lastLogin: new Date() } }
);

// $unset - Remove fields
await Economy.update(
  { userId },
  { $unset: { temporaryBuff: 1 } }
);
```

## Query Operators

```javascript
// Comparison
eq: Equal
ne: Not Equal
gt: Greater Than
gte: Greater Than or Equal
lt: Less Than
lte: Less Than or Equal
in: In Array
like: Like (SQL LIKE)

// Examples
await Economy.find({
  level: { gte: 10 },
  name: { like: 'John%' },
  status: { in: ['active', 'premium'] }
});
```

## TypeScript Support

```typescript
interface UserDocument {
  id?: number;
  userId: string;
  money: number;
  bank: number;
  inventory: string;
}

const User = sqlmongoose.model<UserDocument>('User', userSchema);
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

## JavaScript Examples

### Basic Setup
```javascript
// index.js
const sqlmongoose = require('sqlmongoose');

async function init() {
  await sqlmongoose.connect('database.db');
  require('./schemas/UserSchema');
  require('./schemas/EconomySchema');
}

init().catch(console.error);
```

### Schema Definition
```javascript
// schemas/EconomySchema.js
const sqlmongoose = require('sqlmongoose');
const { Schema } = sqlmongoose;

const economySchema = new Schema({
  userId: {
    type: 'STRING',
    required: true,
    unique: true
  },
  money: {
    type: 'NUMBER',
    default: 0,
    validate: value => value >= 0
  },
  bank: {
    type: 'NUMBER',
    default: 0
  },
  inventory: {
    type: 'STRING',
    default: JSON.stringify({
      items: [],
      lastUpdated: new Date()
    })
  },
  dailyStreak: {
    type: 'NUMBER',
    default: 0
  },
  lastDaily: {
    type: 'DATE',
    default: null
  }
});

// Hooks example
economySchema.pre('save', async function(data) {
  // Convert objects to JSON strings
  if (typeof data.inventory === 'object') {
    data.inventory = JSON.stringify(data.inventory);
  }
});

economySchema.post('save', async function(data) {
  // Parse JSON strings back to objects
  if (typeof data.inventory === 'string') {
    data.inventory = JSON.parse(data.inventory);
  }
});

module.exports = sqlmongoose.model('Economy', economySchema);
```

### Using in Commands (Discord.js Example)
```javascript
// commands/balance.js
const { SlashCommandBuilder } = require('discord.js');
const Economy = require('../schemas/EconomySchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your or someone else\'s balance')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('User to check')
        .setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    
    let userData = await Economy.findOne({ userId: target.id });
    
    if (!userData) {
      userData = await Economy.create({
        userId: target.id,
        money: 1000, // Starting money
        bank: 0
      });
    }

    const embed = {
      title: `💰 ${target.username}'s Balance`,
      fields: [
        { name: 'Cash', value: `$${userData.money}`, inline: true },
        { name: 'Bank', value: `$${userData.bank}`, inline: true },
        { name: 'Total', value: `$${userData.money + userData.bank}` }
      ],
      color: 0x0099FF
    };

    await interaction.reply({ embeds: [embed] });
  }
};

// commands/daily.js
const Economy = require('../schemas/EconomySchema');
const ONE_DAY = 24 * 60 * 60 * 1000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Collect your daily reward'),

  async execute(interaction) {
    const user = await Economy.findOne({ userId: interaction.user.id });
    const now = new Date();
    
    if (user.lastDaily && (now - new Date(user.lastDaily)) < ONE_DAY) {
      const timeLeft = ONE_DAY - (now - new Date(user.lastDaily));
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      return interaction.reply(
        `You can collect your daily reward in ${hoursLeft} hours!`
      );
    }

    const reward = 100 * (user.dailyStreak + 1);
    
    await Economy.update(
      { userId: interaction.user.id },
      { 
        $inc: { 
          money: reward,
          dailyStreak: 1
        },
        $set: { lastDaily: now }
      }
    );

    await interaction.reply(
      `You collected $${reward}! 🎉\nDaily streak: ${user.dailyStreak + 1}`
    );
  }
};
```

### Advanced Examples

#### Economy System
```javascript
// economy/transactions.js
const Economy = require('../schemas/EconomySchema');

async function transfer(fromId, toId, amount) {
  return await sqlmongoose.transaction(async () => {
    const [from, to] = await Promise.all([
      Economy.findOne({ userId: fromId }),
      Economy.findOne({ userId: toId })
    ]);

    if (!from || !to) throw new Error('User not found');
    if (from.money < amount) throw new Error('Insufficient funds');

    await Promise.all([
      Economy.update(
        { userId: fromId },
        { $inc: { money: -amount } }
      ),
      Economy.update(
        { userId: toId },
        { $inc: { money: amount } }
      )
    ]);

    return { from, to, amount };
  });
}

async function addItem(userId, item) {
  const user = await Economy.findOne({ userId });
  const inventory = JSON.parse(user.inventory);
  
  inventory.items.push({
    ...item,
    obtainedAt: new Date()
  });

  await Economy.update(
    { userId },
    { 
      $set: { 
        inventory: JSON.stringify(inventory)
      }
    }
  );
}

// economy/shop.js
async function buyItem(userId, itemId) {
  const user = await Economy.findOne({ userId });
  const item = SHOP_ITEMS[itemId];

  if (!item) throw new Error('Item not found');
  if (user.money < item.price) throw new Error('Insufficient funds');

  await Economy.update(
    { userId },
    { $inc: { money: -item.price } }
  );

  await addItem(userId, item);
  return item;
}
```

#### Advanced Queries
```javascript
// queries/leaderboard.js
async function getLeaderboard() {
  return await Economy.find(
    { 
      money: { gt: 0 },
      lastDaily: { 
        gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      }
    },
    {
      orderBy: { money: 'DESC' },
      limit: 10
    }
  );
}

async function getActiveUsers() {
  return await Economy.find({
    lastDaily: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    money: { gt: 1000 }
  });
}

async function searchUsers(query) {
  return await Economy.find({
    $or: [
      { username: { like: `%${query}%` } },
      { userId: { eq: query } }
    ]
  });
}
```

## JavaScript Examples

### CommonJS Usage
```javascript
const { createConnection, Schema, Model } = require('sqlmongoose');

// Create database connection
const db = createConnection('example.db');

// Define schema
const userSchema = new Schema({
  name: { type: 'STRING', required: true },
  email: { type: 'STRING', unique: true },
  age: { type: 'NUMBER' },
  isActive: { type: 'BOOLEAN', default: true }
});

// Create model
const UserModel = new Model(db, 'users', userSchema);

// Example usage with Promise chains
UserModel.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
})
  .then(user => console.log('User created:', user))
  .catch(err => console.error('Error:', err));

// Example with async/await
async function findUsers() {
  try {
    // Find users with advanced queries
    const users = await UserModel.find({
      age: { gt: 18, lt: 65 },
      isActive: true
    }, {
      limit: 10,
      orderBy: { name: 'ASC' }
    });
    
    console.log('Active users:', users);

    // Update users
    const updated = await UserModel.update(
      { age: { lt: 18 } },
      { isActive: false }
    );
    console.log('Updated records:', updated);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Transactions example
async function createUserWithOrder() {
  const connection = createConnection('store.db');
  
  try {
    await connection.transaction(async (db) => {
      const UserModel = new Model(db, 'users', userSchema);
      const OrderModel = new Model(db, 'orders', orderSchema);

      const user = await UserModel.create({
        name: 'Jane Doe',
        email: 'jane@example.com'
      });

      await OrderModel.create({
        userId: user.id,
        total: 99.99,
        status: 'pending'
      });
    });
    console.log('Transaction completed successfully');
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

// Hooks example in JavaScript
userSchema.pre('save', async function(data) {
  data.createdAt = new Date();
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
});

// Relationships example
const orderSchema = new Schema({
  userId: { type: 'NUMBER', ref: 'users' },
  total: { type: 'NUMBER' }
});

// Find orders with populated user data
OrderModel.find(
  { total: { gt: 100 } },
  { populate: ['userId'] }
)
  .then(orders => {
    orders.forEach(order => {
      console.log(`Order total: ${order.total}`);
      console.log(`Customer: ${order.userId.name}`);
    });
  });
```

### ES Modules Usage
```javascript
import { createConnection, Schema, Model } from 'sqlmongoose';

const db = createConnection('example.db');

const productSchema = new Schema({
  name: { 
    type: 'STRING',
    validate: value => value.length >= 3
  },
  price: { 
    type: 'NUMBER',
    required: true
  }
});

const ProductModel = new Model(db, 'products', productSchema);

// Using top-level await (Node.js 14.8+ or ES modules)
try {
  const product = await ProductModel.create({
    name: 'Test Product',
    price: 29.99
  });
  console.log('Product created:', product);
  
  const products = await ProductModel.find({
    price: { lt: 100 }
  });
  console.log('Affordable products:', products);
} catch (error) {
  console.error('Error:', error);
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
