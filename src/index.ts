import { Database } from 'sqlite3';
import { Schema } from './Schema';
import { Model } from './Model';

class SQLMongoose {
  private static instance: SQLMongoose;
  private db: Database | null = null;
  private models: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): SQLMongoose {
    if (!SQLMongoose.instance) {
      SQLMongoose.instance = new SQLMongoose();
    }
    return SQLMongoose.instance;
  }

  connect(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new Database(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  model<T extends object>(name: string, schema?: Schema): any {
    if (schema) {
      if (!this.db) throw new Error('Database not connected');
      const model = new Model<T>(this.db, name.toLowerCase(), schema);
      this.models.set(name, model);
      return model;
    }
    return this.models.get(name);
  }

  getConnection(): Database {
    if (!this.db) throw new Error('Database not connected');
    return this.db;
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      await new Promise((resolve, reject) => {
        this.db!.close((err) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
      this.db = null;
    }
  }
}

const sqlmongoose = SQLMongoose.getInstance();
export { Schema, sqlmongoose as default };
