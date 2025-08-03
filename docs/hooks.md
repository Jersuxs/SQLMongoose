# Hooks (Middleware)

Hooks (also called middleware) are functions that are executed at specific points in the lifecycle of a query or document. They are useful for atomizing logic and creating reusable plugins.

## Available Hooks

SQLMongoose supports two types of hooks:

- `pre`: Executed **before** an operation.
- `post`: Executed **after** an operation.

These can be applied to the following operations:

- `save`: When a document is created.
- `update`: When a document is updated.
- `remove`: When a document is deleted.

## Defining Hooks

You can define hooks on a schema.

### `pre` Hooks

`pre` hooks are executed before the main operation. They receive the data that will be used in the operation.

```typescript
import { Schema, DataTypes } from 'sqlmongoose';

const userSchema = new Schema({
  password: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE },
});

// Hash the password before saving
userSchema.pre('save', async (data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
});

// Set the createdAt timestamp before saving
userSchema.pre('save', (data) => {
  data.createdAt = new Date();
});
```

### `post` Hooks

`post` hooks are executed after the main operation. They receive the result of the operation.

```typescript
// Send a welcome email after a user is created
userSchema.post('save', (user) => {
  sendWelcomeEmail(user.email);
});
```
