# Queries

SQLMongoose features a powerful and fluent `QueryBuilder` that allows you to construct complex database queries with ease.

## The Query Builder

You can get a `QueryBuilder` instance by calling the `find()` method on a model.

```typescript
const qb = User.find();
```

## Chaining Methods

The `QueryBuilder` allows you to chain methods to build your query.

### `where(field, operator, value)`

Adds a `WHERE` clause to the query.

```typescript
// Find users with age greater than 25
const users = await User.find().where('age', '>', 25).execute();
```

Supported operators:

- `=`
- `!=`
- `>`
- `>=`
- `<`
- `<=`
- `LIKE`
- `IN`

### `limit(number)`

Limits the number of documents returned.

```typescript
// Get the first 10 users
const users = await User.find().limit(10).execute();
```

### `offset(number)`

Skips a number of documents.

```typescript
// Get 10 users, skipping the first 20
const users = await User.find().limit(10).offset(20).execute();
```

### `sort(field, direction)`

Sorts the results by a field.

```typescript
// Get users sorted by age in descending order
const users = await User.find().sort('age', 'DESC').execute();
```

### `select(fields)`

Selects which fields to return.

```typescript
// Get only the name and email of users
const users = await User.find().select(['name', 'email']).execute();
```

## Executing the Query

Once you have built your query, call the `execute()` method to run it against the database.

```typescript
const results = await User.find().where('age', '>', 18).limit(5).execute();
```
