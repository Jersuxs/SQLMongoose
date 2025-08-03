# Models

Models are constructors compiled from schema definitions. They are used to create, read, update, and delete documents from the database.

## Defining a Model

Once you have a schema, you can define a model using `sqlmongoose.define()`:

```typescript
import { sqlmongoose, Schema, DataTypes } from 'sqlmongoose';

const userSchema = new Schema({ name: DataTypes.STRING });
const User = sqlmongoose.define('User', userSchema);
```

## Creating Documents

Use the `create()` method on your model to create a new document:

```typescript
const user = await User.create({ name: 'John Doe' });
```

## Finding Documents

SQLMongoose provides a rich API for finding documents.

### `find()`

Returns a `QueryBuilder` instance that you can use to build complex queries. Returns an array of documents.

```typescript
const users = await User.find().where('age', '>', 25).execute();
```

### `findOne()`

Finds a single document that matches the query. Returns the document or `null`.

```typescript
const user = await User.findOne({ email: 'john.doe@example.com' });
```

### `findById()`

Finds a single document by its `id`. Returns the document or `null`.

```typescript
const user = await User.findById(1);
```

## Updating Documents

### `updateOne()`

Updates a single document that matches the query. Returns the number of updated documents.

```typescript
const updatedCount = await User.updateOne({ name: 'John Doe' }, { age: 31 });
```

## Deleting Documents

### `deleteOne()`

Deletes a single document that matches the query. Returns the number of deleted documents.

```typescript
const deletedCount = await User.deleteOne({ name: 'John Doe' });
```
