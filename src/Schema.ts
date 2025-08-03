export enum DataTypes {
  STRING = 'TEXT',
  NUMBER = 'NUMERIC',
  BOOLEAN = 'INTEGER',
  DATE = 'TEXT',
  JSON = 'TEXT'
}

export interface SchemaField {
  type: DataTypes;
  required?: boolean;
  unique?: boolean;
  default?: any;
  index?: boolean;
  validate?: (value: any) => boolean;
}

export interface SchemaDefinition {
  [key: string]: SchemaField | DataTypes;
}

export class Schema {
  public definition: SchemaDefinition;
  public hooks: {
    pre: Map<string, Function[]>;
    post: Map<string, Function[]>;
  } = { pre: new Map(), post: new Map() };

  constructor(definition: SchemaDefinition) {
    this.definition = this.normalizeDefinition(definition);
  }

  private normalizeDefinition(definition: SchemaDefinition): SchemaDefinition {
    const normalized: SchemaDefinition = {};
    for (const [key, value] of Object.entries(definition)) {
      if (typeof value === 'string') {
        normalized[key] = { type: value as DataTypes };
      } else {
        normalized[key] = value as SchemaField;
      }
    }
    return normalized;
  }

  public pre(hook: string, fn: Function) {
    const preHooks = this.hooks.pre.get(hook) || [];
    preHooks.push(fn);
    this.hooks.pre.set(hook, preHooks);
  }

  public post(hook: string, fn: Function) {
    const postHooks = this.hooks.post.get(hook) || [];
    postHooks.push(fn);
    this.hooks.post.set(hook, postHooks);
  }

  public getCreateTableSQL(tableName: string): string[] {
    const columns: string[] = [];
    const indexes: string[] = [];

    for (const [fieldName, field] of Object.entries(this.definition)) {
      const fieldDef = field as SchemaField;
      let column = `${fieldName} ${fieldDef.type}`;
      if (fieldDef.required) column += ' NOT NULL';
      if (fieldDef.unique) column += ' UNIQUE';
      if (fieldDef.default !== undefined) column += ` DEFAULT ${JSON.stringify(fieldDef.default)}`;
      columns.push(column);

      if (fieldDef.index) {
        indexes.push(`CREATE INDEX IF NOT EXISTS idx_${tableName}_${fieldName} ON ${tableName}(${fieldName})`);
      }
    }

    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns.join(', ')});`;
    return [createTableSQL, ...indexes];
  }
}