type SchemaType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE';

interface SchemaField {
  type: SchemaType;
  required?: boolean;
  default?: any;
  validate?: (value: any) => boolean | Promise<boolean>;
  index?: boolean;
  unique?: boolean;
  ref?: string; // For relationships
}

interface SchemaDefinition {
  [key: string]: SchemaField;
}

export class Schema {
  private definition: SchemaDefinition;
  private hooks: {
    preSave: Function[];
    postSave: Function[];
    preUpdate: Function[];
    postUpdate: Function[];
  };

  constructor(definition: SchemaDefinition) {
    this.definition = definition;
    this.hooks = {
      preSave: [],
      postSave: [],
      preUpdate: [],
      postUpdate: []
    };
  }

  public pre(hook: 'save' | 'update', fn: Function) {
    if (hook === 'save') this.hooks.preSave.push(fn);
    if (hook === 'update') this.hooks.preUpdate.push(fn);
  }

  public post(hook: 'save' | 'update', fn: Function) {
    if (hook === 'save') this.hooks.postSave.push(fn);
    if (hook === 'update') this.hooks.postUpdate.push(fn);
  }

  public async runValidation(data: any): Promise<boolean> {
    for (const [field, config] of Object.entries(this.definition)) {
      if (config.required && !data[field]) {
        throw new Error(`Field ${field} is required`);
      }
      if (config.validate && !await config.validate(data[field])) {
        throw new Error(`Validation failed for field ${field}`);
      }
    }
    return true;
  }

  public createTable(tableName: string): string[] {
    const queries: string[] = [];
    
    // Main table creation
    const columns = Object.entries(this.definition).map(([fieldName, field]) => {
      const type = this.getSqliteType(field.type);
      const required = field.required ? 'NOT NULL' : 'NULL';
      const unique = field.unique ? 'UNIQUE' : '';
      return `${fieldName} ${type} ${required} ${unique}`.trim();
    });

    queries.push(`CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${columns.join(',\n      ')}
    )`);

    // Create indexes
    Object.entries(this.definition).forEach(([fieldName, field]) => {
      if (field.index || field.unique) {
        queries.push(
          `CREATE ${field.unique ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS 
          idx_${tableName}_${fieldName} ON ${tableName}(${fieldName})`
        );
      }
    });

    return queries;
  }

  private getSqliteType(type: SchemaType): string {
    switch (type) {
      case 'STRING': return 'TEXT';
      case 'NUMBER': return 'NUMERIC';
      case 'BOOLEAN': return 'INTEGER';
      case 'DATE': return 'TEXT';
      default: return 'TEXT';
    }
  }

  public getRelationships(): { [key: string]: string } {
    const relationships: { [key: string]: string } = {};
    Object.entries(this.definition).forEach(([field, config]) => {
      if (config.ref) {
        relationships[field] = config.ref;
      }
    });
    return relationships;
  }
}
