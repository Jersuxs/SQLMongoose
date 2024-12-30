import { Database } from 'sqlite3';
import { Schema } from './Schema';
import { Model } from './Model';

class SQLiteDB {
  private db: Database | null = null;
  private models: Map<string, any> = new Map();

  // Conectar a la base de datos
  async connect(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new Database(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Definir un modelo
  define<T extends object>(name: string, schema: Schema): Model<T> {
    if (!this.db) throw new Error('Database not connected');
    const model = new Model<T>(this.db, name.toLowerCase(), schema);
    this.models.set(name, model);
    return model;
  }

  // Obtener un modelo
  model<T extends object>(name: string): Model<T> {
    const model = this.models.get(name);
    if (!model) throw new Error(`Model ${name} not found`);
    return model;
  }

  getDatabase(): Database | null {
    return this.db;
  }

  async close(): Promise<void> {
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

// Exportar una instancia única
export const sqlmongoose = new SQLiteDB();
export { Schema };
