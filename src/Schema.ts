type SchemaType = 'String' | 'Number' | 'Boolean' | 'Date' | 'Array' | 'Map' | 'Mixed';

interface SchemaField {
  type: SchemaType | SchemaField[];
  required?: boolean;
  unique?: boolean;
  default?: any;
  of?: SchemaField | SchemaType;
  validate?: (value: any) => Promise<boolean> | boolean;
  ref?: string;
  index?: boolean;
}

interface ArraySchemaField extends SchemaField {
  type: 'Array';
  of: SchemaField | SchemaType;
}

type NormalizedSchemaField = SchemaField | ArraySchemaField;

interface SchemaDefinition {
  [key: string]: SchemaField | SchemaType | SchemaField[];
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
    this.definition = this.normalizeDefinition(definition);
    this.hooks = {
      preSave: [],
      postSave: [],
      preUpdate: [],
      postUpdate: []
    };
  }

  private normalizeDefinition(definition: SchemaDefinition): SchemaDefinition {
    const normalized: SchemaDefinition = {};
    
    for (const [key, value] of Object.entries(definition)) {
      if (typeof value === 'string') {
        normalized[key] = { type: value as SchemaType };
      } else if (Array.isArray(value)) {
        normalized[key] = { type: 'Array', of: value[0] };
      } else {
        normalized[key] = value as SchemaField;
      }
    }

    return normalized;
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
      const fieldConfig = config as SchemaField;
      if (fieldConfig.required && !data[field]) {
        throw new Error(`Field ${field} is required`);
      }
      if (fieldConfig.validate && !await fieldConfig.validate(data[field])) {
        throw new Error(`Validation failed for field ${field}`);
      }
    }
    return true;
  }

  public createTable(tableName: string): string[] {
    const queries: string[] = [];
    
    // Convert schema types to SQLite types
    const columns = Object.entries(this.definition).map(([fieldName, field]) => {
      const fieldConfig = typeof field === 'string' ? { type: field } : (Array.isArray(field) ? { type: 'Array', of: field[0] } : field) as SchemaField;
      const type = this.getSqliteType(fieldConfig.type as SchemaType);
      const required = fieldConfig.required ? 'NOT NULL' : 'NULL';
      const unique = fieldConfig.unique ? 'UNIQUE' : '';
      return `${fieldName} ${type} ${required} ${unique}`.trim();
    });

    queries.push(`CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${columns.join(',\n      ')}
    )`);

    // Create indexes
    Object.entries(this.definition).forEach(([fieldName, field]) => {
      const fieldConfig = typeof field === 'string' ? { type: field } : (Array.isArray(field) ? { type: 'Array', of: field[0] } : field) as SchemaField;
      if (fieldConfig.index || fieldConfig.unique) {
        queries.push(
          `CREATE ${fieldConfig.unique ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS 
          idx_${tableName}_${fieldName} ON ${tableName}(${fieldName})`
        );
      }
    });

    return queries;
  }

  private getSqliteType(type: SchemaType): string {
    switch (type) {
      case 'String': return 'TEXT';
      case 'Number': return 'NUMERIC';
      case 'Boolean': return 'INTEGER';
      case 'Date': return 'TEXT';
      case 'Array':
      case 'Map':
      case 'Mixed':
        return 'TEXT'; // Stored as JSON
      default: return 'TEXT';
    }
  }

  public getRelationships(): { [key: string]: string } {
    const relationships: { [key: string]: string } = {};
    Object.entries(this.definition).forEach(([field, config]) => {
      if (typeof config === 'object' && !Array.isArray(config) && 'ref' in config && config.ref) {
        relationships[field] = config.ref;
      }
    });
    return relationships;
  }
}
