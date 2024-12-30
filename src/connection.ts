import sqlite3 from 'sqlite3';
import { EventEmitter } from 'events';
import { Pool } from 'generic-pool';
import genericPool from 'generic-pool';

export interface ConnectionConfig {
  path: string;
  poolSize?: number;
  timeout?: number;
}

export class Connection extends EventEmitter {
  private pool: Pool<sqlite3.Database>;
  private isConnected = false;

  constructor(config: ConnectionConfig) {
    super();
    this.pool = createConnectionPool(config);
  }

  async query<T>(sql: string, params: any[] = []): Promise<T> {
    const client = await this.pool.acquire();
    try {
      return await new Promise((resolve, reject) => {
        client.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows as T);
        });
      });
    } finally {
      await this.pool.release(client);
    }
  }

  async transaction<T>(fn: (client: sqlite3.Database) => Promise<T>): Promise<T> {
    const client = await this.pool.acquire();
    try {
      await new Promise((resolve, reject) => {
        client.run('BEGIN TRANSACTION', (err) => {
          if (err) reject(err);
          else resolve(true);
        });
      });

      const result = await fn(client);

      await new Promise((resolve, reject) => {
        client.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve(true);
        });
      });

      return result;
    } catch (error) {
      await new Promise((resolve) => {
        client.run('ROLLBACK', () => resolve(true));
      });
      throw error;
    } finally {
      await this.pool.release(client);
    }
  }
}
function createConnectionPool(config: ConnectionConfig): Pool<sqlite3.Database> {
    const factory = {
        create: () => {
            return new Promise<sqlite3.Database>((resolve, reject) => {
                const db = new sqlite3.Database(config.path, (err) => {
                    if (err) reject(err);
                    else resolve(db);
                });
            });
        },
        destroy: (client: sqlite3.Database) => {
            return new Promise<void>((resolve) => {
                client.close(() => resolve());
            });
        }
    };

    return createPool(factory, {
        max: config.poolSize || 5,
        min: 0,
        acquireTimeoutMillis: config.timeout || 30000,
        autostart: true
    });
}
function createPool(factory: { 
    create: () => Promise<sqlite3.Database>; 
    destroy: (client: sqlite3.Database) => Promise<void>; 
}, options: { 
    max: number; 
    min: number; 
    acquireTimeoutMillis: number; 
    autostart: boolean; 
}): Pool<sqlite3.Database> {
    return genericPool.createPool(factory, options);
}

