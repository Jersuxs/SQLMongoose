import { Database } from 'sqlite3';
import { Schema } from './Schema';

type Operator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';

interface QueryCondition {
  [key: string]: {
    [op in Operator]?: any;
  };
}

export class Model<T extends object> {
  private db: Database;
  private tableName: string;
  private schema: Schema;

  constructor(db: Database, tableName: string, schema: Schema) {
    this.db = db;
    this.tableName = tableName;
    this.schema = schema;
    this.initialize();
  }

  private initialize() {
    const createTableQuery = this.schema.createTable(this.tableName);
    this.db.run(createTableQuery.join(';'));
  }

  async find(query: QueryCondition | Partial<T> = {}, options: {
    populate?: string[];
    limit?: number;
    offset?: number;
    orderBy?: { [key: string]: 'ASC' | 'DESC' };
  } = {}): Promise<T[]> {
    let conditions: string[] = [];
    let values: any[] = [];

    if (this.isSimpleQuery(query)) {
      Object.entries(query).forEach(([key, value]) => {
        conditions.push(`${key} = ?`);
        values.push(value);
      });
    } else {
      Object.entries(query).forEach(([field, operators]) => {
        Object.entries(operators).forEach(([op, value]) => {
          switch (op as Operator) {
            case 'eq': conditions.push(`${field} = ?`); values.push(value); break;
            case 'ne': conditions.push(`${field} != ?`); values.push(value); break;
            case 'gt': conditions.push(`${field} > ?`); values.push(value); break;
            case 'gte': conditions.push(`${field} >= ?`); values.push(value); break;
            case 'lt': conditions.push(`${field} < ?`); values.push(value); break;
            case 'lte': conditions.push(`${field} <= ?`); values.push(value); break;
            case 'like': conditions.push(`${field} LIKE ?`); values.push(`%${value}%`); break;
            case 'in': conditions.push(`${field} IN (${value.map(() => '?').join(',')})`); 
                      values.push(...value); break;
          }
        });
      });
    }

    let sql = conditions.length
      ? `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' AND ')}`
      : `SELECT * FROM ${this.tableName}`;

    if (options.orderBy) {
      const orderClauses = Object.entries(options.orderBy)
        .map(([field, order]) => `${field} ${order}`)
        .join(', ');
      sql += ` ORDER BY ${orderClauses}`;
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    }

    const results = await this.query(sql, values);

    if (options.populate) {
      return this.populateRelationships(results, options.populate);
    }

    return results;
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    const result = await this.find(query);
    return result[0] || null;
  }

  async create(data: T): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = new Array(keys.length).fill('?').join(',');

    const sql = `INSERT INTO ${this.tableName} (${keys.join(',')}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        resolve({ ...data, id: this.lastID });
      });
    });
  }

  async update(query: Partial<T>, update: Partial<T>): Promise<number> {
    for (const hook of this.schema['hooks'].preUpdate) {
      await hook(update);
    }

    const setClause = Object.keys(update)
      .map(key => `${key} = ?`)
      .join(', ');
    const whereClause = Object.keys(query)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    const values = [...Object.values(update), ...Object.values(query)];
    
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        resolve(this.changes);
      });
    });
  }

  async delete(query: Partial<T>): Promise<number> {
    const whereClause = Object.keys(query)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    const values = Object.values(query);
    
    const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        resolve(this.changes);
      });
    });
  }

  private async populateRelationships(results: T[], fields: string[]): Promise<T[]> {
    const relationships = this.schema.getRelationships();
    
    for (const result of results) {
      for (const field of fields) {
        if (relationships[field]) {
          const refModel = relationships[field];
          const foreignKey = (result as any)[field];
          if (foreignKey) {
            (result as any)[field] = await this.db.get(
              `SELECT * FROM ${refModel} WHERE id = ?`,
              [foreignKey]
            );
          }
        }
      }
    }

    return results;
  }

  private isSimpleQuery(query: any): query is Partial<T> {
    return !Object.values(query).some(v => typeof v === 'object');
  }

  private query(sql: string, params: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows as T[]);
      });
    });
  }
}
