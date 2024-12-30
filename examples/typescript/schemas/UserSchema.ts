import { Schema } from 'sqlmongoose';
const bcrypt = require('bcrypt');

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  profile?: {
    avatar: string;
    bio: string;
  };
}

const userSchema = new Schema({
  username: {
    type: 'STRING',
    required: true,
    unique: true,
    validate: (value: string) => value.length >= 3
  },
  email: {
    type: 'STRING',
    required: true,
    unique: true,
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  password: {
    type: 'STRING',
    required: true
  },
  age: {
    type: 'NUMBER',
    validate: (value: number) => value >= 13
  },
  isActive: {
    type: 'BOOLEAN',
    default: true
  },
  createdAt: {
    type: 'DATE',
    default: () => new Date()
  },
  updatedAt: {
    type: 'DATE'
  },
  roles: {
    type: 'STRING',
    default: '[]'
  },
  profile: {
    type: 'STRING',
    default: '{}'
  }
});

// Pre-save hook for password hashing and JSON conversion
userSchema.pre('save', async function(data) {
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  if (typeof data.roles === 'object') {
    data.roles = JSON.stringify(data.roles);
  }
  if (typeof data.profile === 'object') {
    data.profile = JSON.stringify(data.profile);
  }
  data.updatedAt = new Date();
});

// Post-save hook for JSON parsing
userSchema.post('save', async function(data) {
  if (typeof data.roles === 'string') {
    data.roles = JSON.parse(data.roles);
  }
  if (typeof data.profile === 'string') {
    data.profile = JSON.parse(data.profile);
  }
});

export default userSchema;
async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

