import { Pool } from 'generic-pool';
import { Database } from 'sqlite3';
import { Schema } from './Schema';
import { QueryBuilder } from './QueryBuilder';

export class Model<T extends object> {
  private pool: Pool<Database>;
  private tableName: string;
  private schema: Schema;

  constructor(pool: Pool<Database>, tableName: string, schema: Schema) {
    this.pool = pool;
    this.tableName = tableName;
    this.schema = schema;
    this.init();
  }

  private async init() {
    const client = await this.pool.acquire();
    try {
      const queries = this.schema.getCreateTableSQL(this.tableName);
      for (const query of queries) {
        await new Promise<void>((resolve, reject) => {
          client.run(query, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    } finally {
      this.pool.release(client);
    }
  }

  private async runPreHooks(hook: string, data: any) {
    const hooks = this.schema.hooks.pre.get(hook) || [];
    for (const hookFn of hooks) {
      await hookFn(data);
    }
  }

  private async runPostHooks(hook: string, data: any) {
    const hooks = this.schema.hooks.post.get(hook) || [];
    for (const hookFn of hooks) {
      await hookFn(data);
    }
  }

  async create(data: T): Promise<T> {
    await this.runPreHooks('save', data);

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;

    const client = await this.pool.acquire();
    try {
      return await new Promise((resolve, reject) => {
        client.get(sql, values, (err, row) => {
          if (err) reject(err);
          else {
            this.runPostHooks('save', row);
            resolve(row as T);
          }
        });
      });
    } finally {
      this.pool.release(client);
    }
  }

  find(): QueryBuilder<T> {
    return new QueryBuilder<T>(this.pool, this.tableName);
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    const qb = new QueryBuilder<T>(this.pool, this.tableName).limit(1);
    for (const [key, value] of Object.entries(query)) {
      qb.where(key as keyof T, '=', value);
    }
    const results = await qb.execute();
    return results[0] || null;
  }

  async findById(id: number): Promise<T | null> {
    return this.findOne({ id } as Partial<T>);
  }

  async updateOne(query: Partial<T>, update: Partial<T>): Promise<number> {
    await this.runPreHooks('update', { query, update });

    const updateKeys = Object.keys(update);
    const updateValues = Object.values(update);
    const setClause = updateKeys.map(key => `${key} = ?`).join(', ');

    const queryKeys = Object.keys(query);
    const queryValues = Object.values(query);
    const whereClause = queryKeys.map(key => `${key} = ?`).join(' AND ');

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`;
    const values = [...updateValues, ...queryValues];

    const client = await this.pool.acquire();
    try {
      return await new Promise((resolve, reject) => {
        client.run(sql, values, function (err) {
          if (err) reject(err);
          else {
            // @ts-ignore
            const changes = this.changes;
            resolve(changes);
          }
        });
      });
    } finally {
      this.pool.release(client);
    }
  }

  async deleteOne(query: Partial<T>): Promise<number> {
    await this.runPreHooks('remove', query);

    const queryKeys = Object.keys(query);
    const queryValues = Object.values(query);
    const whereClause = queryKeys.map(key => `${key} = ?`).join(' AND ');

    const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;

    const client = await this.pool.acquire();
    try {
      return await new Promise((resolve, reject) => {
        client.run(sql, queryValues, function (err) {
          if (err) reject(err);
          else {
            // @ts-ignore
            const changes = this.changes;
            resolve(changes);
          }
        });
      });
    } finally {
      this.pool.release(client);
    }
  }
}