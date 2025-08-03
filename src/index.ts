import { Database } from 'sqlite3';
import { Schema } from './Schema';
import { Model } from './Model';
import { Pool, createPool } from 'generic-pool';

class SQLMongoose {
  private pool: Pool<Database> | null = null;
  private models: Map<string, any> = new Map();

  async connect(path: string): Promise<void> {
    const factory = {
      create: () => new Promise<Database>((resolve, reject) => {
        const db = new Database(path, (err) => {
          if (err) reject(err);
          else resolve(db);
        });
      }),
      destroy: (client: Database) => new Promise<void>((resolve) => {
        client.close(() => resolve());
      })
    };

    this.pool = createPool(factory, { max: 10, min: 2 });
  }

  define<T extends object>(name: string, schema: Schema): Model<T> {
    if (!this.pool) throw new Error('Database not connected');
    const model = new Model<T>(this.pool, name.toLowerCase(), schema);
    this.models.set(name, model);
    return model;
  }

  model<T extends object>(name: string): Model<T> {
    const model = this.models.get(name);
    if (!model) throw new Error(`Model ${name} not found`);
    return model;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.drain();
      await this.pool.clear();
      this.pool = null;
    }
  }
}

export const sqlmongoose = new SQLMongoose();
export { Schema };