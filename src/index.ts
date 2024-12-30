import { Database } from 'sqlite3';
export { Schema } from './Schema';
export { Model } from './Model';

export class Connection {
  private db: Database;

  constructor(path: string) {
    this.db = new Database(path);
  }

  async transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        callback(this.db)
          .then((result) => {
            this.db.run('COMMIT', (err) => {
              if (err) {
                this.db.run('ROLLBACK');
                reject(err);
              } else {
                resolve(result);
              }
            });
          })
          .catch((err) => {
            this.db.run('ROLLBACK');
            reject(err);
          });
      });
    });
  }

  getDatabase(): Database {
    return this.db;
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export function createConnection(path: string): Connection {
  return new Connection(path);
}
