import { Pool } from 'generic-pool';
import { Database } from 'sqlite3';

export class QueryBuilder<T> {
  private conditions: string[] = [];
  private values: any[] = [];
  private limitValue: number | null = null;
  private offsetValue: number | null = null;
  private sortValue: { [key: string]: 'ASC' | 'DESC' } = {};
  private selectFields: string[] = ['*'];

  constructor(private pool: Pool<Database>, private tableName: string) {}

  where(field: keyof T, operator: string, value: any): this {
    this.conditions.push(`${field as string} ${operator} ?`);
    this.values.push(value);
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  sort(field: keyof T, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.sortValue[field as string] = direction;
    return this;
  }

  select(fields: (keyof T)[]): this {
    this.selectFields = fields as string[];
    return this;
  }

  async execute(): Promise<T[]> {
    let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.tableName}`;

    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    }

    if (Object.keys(this.sortValue).length > 0) {
      const sortClauses = Object.entries(this.sortValue)
        .map(([field, direction]) => `${field} ${direction}`)
        .join(', ');
      sql += ` ORDER BY ${sortClauses}`;
    }

    if (this.limitValue !== null) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue !== null) {
      sql += ` OFFSET ${this.offsetValue}`;
    }

    const client = await this.pool.acquire();
    try {
      return await new Promise((resolve, reject) => {
        client.all(sql, this.values, (err, rows) => {
          if (err) reject(err);
          else resolve(rows as T[]);
        });
      });
    } finally {
      this.pool.release(client);
    }
  }
}