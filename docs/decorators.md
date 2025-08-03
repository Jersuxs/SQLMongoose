# Decorators

For those who prefer a more declarative, class-based approach, SQLMongoose provides decorators to define your models.

**Note:** To use decorators, you must enable the `experimentalDecorators` and `emitDecoratorMetadata` options in your `tsconfig.json`.

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## `@Entity(name)`

This decorator marks a class as a model. The `name` parameter is the name of the table in the database.

## `@Field(options)`

This decorator marks a class property as a field in the model. The `options` parameter is the same as the schema field definition.

## Example

Here's how to define a `User` model using decorators:

```typescript
import { Entity, Field, DataTypes } from 'sqlmongoose';

@Entity('users')
export class User {
  @Field({ type: DataTypes.STRING, required: true })
  name: string;

  @Field({ type: DataTypes.STRING, unique: true })
  email: string;

  @Field({ type: DataTypes.NUMBER, default: 0 })
  age: number;
}
```

Once the class is defined, SQLMongoose will automatically register it as a model. You can then get the model using `sqlmongoose.model('User')`.

```typescript
const UserModel = sqlmongoose.model('User');

const user = await UserModel.create({ name: 'Jane Doe', email: 'jane.doe@example.com' });
```
