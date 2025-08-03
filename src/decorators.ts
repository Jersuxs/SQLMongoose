import 'reflect-metadata';
import { sqlmongoose } from './index';
import { DataTypes, Schema, SchemaDefinition } from './Schema';

export function Entity(name: string) {
  return function (constructor: Function) {
    const fields = Reflect.getMetadata('fields', constructor) || {};
    const schemaDef: SchemaDefinition = {};

    for (const key in fields) {
      schemaDef[key] = fields[key];
    }

    const schema = new Schema(schemaDef);
    sqlmongoose.define(name, schema);
  };
}

export function Field(options: { type: DataTypes, required?: boolean, unique?: boolean, default?: any, index?: boolean }) {
  return function (target: any, propertyKey: string) {
    const fields = Reflect.getMetadata('fields', target.constructor) || {};
    fields[propertyKey] = options;
    Reflect.defineMetadata('fields', fields, target.constructor);
  };
}