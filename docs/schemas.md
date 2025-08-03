# Schemas

A schema defines the structure of your documents within a collection. It specifies the fields, their types, and any constraints or validation rules.

## Defining a Schema

Here's how you can define a simple schema:

```typescript
import { Schema, DataTypes } from 'sqlmongoose';

const userSchema = new Schema({
  name: { type: DataTypes.STRING, required: true },
  email: { type: DataTypes.STRING, unique: true },
  age: { type: DataTypes.NUMBER, default: 0 },
  bio: DataTypes.STRING, // Shorthand for { type: DataTypes.STRING }
});
```

## Schema Types

SQLMongoose supports the following data types:

- `DataTypes.STRING`: Maps to `TEXT` in SQLite.
- `DataTypes.NUMBER`: Maps to `NUMERIC` in SQLite.
- `DataTypes.BOOLEAN`: Maps to `INTEGER` in SQLite (0 or 1).
- `DataTypes.DATE`: Maps to `TEXT` in SQLite (stores as ISO 8601 string).
- `DataTypes.JSON`: Maps to `TEXT` in SQLite (stores as a JSON string).

## Schema Options

You can specify various options for each field in your schema:

- `type`: The data type of the field (required).
- `required`: If `true`, the field cannot be `null`.
- `unique`: If `true`, ensures that the value is unique across all documents in the collection.
- `default`: A default value for the field if none is provided.
- `index`: If `true`, creates an index on this field for faster queries.
- `validate`: A function to validate the field's value. It should return `true` if the value is valid, and `false` otherwise.

### Example with all options

```typescript
const productSchema = new Schema({
  name: {
    type: DataTypes.STRING,
    required: true,
    validate: (value) => value.length > 3,
  },
  price: {
    type: DataTypes.NUMBER,
    required: true,
    default: 10,
    validate: (value) => value > 0,
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    index: true,
  },
});
```
