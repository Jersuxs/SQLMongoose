import 'reflect-metadata';

export enum SchemaType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  OBJECT = 'object'
}

declare global {
    namespace Reflect {
        function defineMetadata(metadataKey: string, metadataValue: any, target: Object): void;
        function getMetadata(metadataKey: string, target: Object): any;
    }
}

export function Entity(name: string) {
  return function (constructor: Function) {
    Reflect.defineMetadata('entity:name', name, constructor);
  };
}

export function Field(options: {
  type?: SchemaType;
  required?: boolean;
  unique?: boolean;
  default?: any;
  ref?: string;
}) {
  return function (target: any, propertyKey: string) {
    const metadata = Reflect.getMetadata('fields', target.constructor) || {};
    metadata[propertyKey] = options;
    Reflect.defineMetadata('fields', metadata, target.constructor);
  };
}

export function Index(options: { unique?: boolean } = {}) {
  return function (target: any, propertyKey: string) {
    const metadata = Reflect.getMetadata('indices', target.constructor) || [];
    metadata.push({ field: propertyKey, ...options });
    Reflect.defineMetadata('indices', metadata, target.constructor);
  };
}
