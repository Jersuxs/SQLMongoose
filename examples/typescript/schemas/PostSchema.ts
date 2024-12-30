import { Schema } from 'sqlmongoose';

export interface IPost {
  id?: number;
  title: string;
  content: string;
  authorId: number;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishDate?: Date;
  metadata: {
    views: number;
    likes: number;
    shares: number;
  };
}

const postSchema = new Schema({
  title: {
    type: 'STRING',
    required: true,
    validate: (value: string) => value.length >= 5
  },
  content: {
    type: 'STRING',
    required: true
  },
  authorId: {
    type: 'NUMBER',
    required: true,
    ref: 'users'
  },
  tags: {
    type: 'STRING',
    default: '[]'
  },
  status: {
    type: 'STRING',
    default: 'draft'
  },
  publishDate: {
    type: 'DATE'
  },
  metadata: {
    type: 'STRING',
    default: JSON.stringify({
      views: 0,
      likes: 0,
      shares: 0
    })
  }
});

// JSON conversion hooks
postSchema.pre('save', async function(data) {
  if (typeof data.tags === 'object') {
    data.tags = JSON.stringify(data.tags);
  }
  if (typeof data.metadata === 'object') {
    data.metadata = JSON.stringify(data.metadata);
  }
});

postSchema.post('save', async function(data) {
  if (typeof data.tags === 'string') {
    data.tags = JSON.parse(data.tags);
  }
  if (typeof data.metadata === 'string') {
    data.metadata = JSON.parse(data.metadata);
  }
});

export default postSchema;
