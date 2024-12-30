export interface QueryCondition {
  [key: string]: {
    operator: string;
    value: any;
  };
}

export class QueryBuilder<T> {
  private conditions: string[] = [];
  private values: any[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private orderByValues: { [key: string]: 'ASC' | 'DESC' } = {};
  private includeFields: string[] = [];

  constructor(private tableName: string) {}

  where(condition: Partial<T> | QueryCondition): this {
    // ...existing query building logic...
    return this;
  }

  select(...fields: (keyof T)[]): this {
    this.includeFields = fields as string[];
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

  orderBy(field: keyof T, direction: 'ASC' | 'DESC'): this {
    this.orderByValues[field as string] = direction;
    return this;
  }

  build(): { sql: string; values: any[] } {
    const fields = this.includeFields.length > 0 
      ? this.includeFields.join(', ')
      : '*';

    let sql = `SELECT ${fields} FROM ${this.tableName}`;

    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    }

    if (Object.keys(this.orderByValues).length > 0) {
      const orderClauses = Object.entries(this.orderByValues)
        .map(([field, direction]) => `${field} ${direction}`)
        .join(', ');
      sql += ` ORDER BY ${orderClauses}`;
    }

    if (this.limitValue !== undefined) {
      sql += ` LIMIT ${this.limitValue}`;
      if (this.offsetValue !== undefined) {
        sql += ` OFFSET ${this.offsetValue}`;
      }
    }

    return { sql, values: this.values };
  }
}
