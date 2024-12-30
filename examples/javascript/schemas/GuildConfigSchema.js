const { Schema } = require('sqlmongoose');

const guildConfigSchema = new Schema({
  guildId: {
    type: 'STRING',
    required: true,
    unique: true,
    index: true
  },
  prefix: {
    type: 'STRING',
    default: '!',
    validate: value => value.length <= 3
  },
  settings: {
    type: 'STRING',
    default: JSON.stringify({
      welcome: {
        enabled: false,
        channel: null,
        message: 'Welcome {user} to {server}!',
        embedColor: '#00ff00'
      },
      automod: {
        enabled: false,
        ignoredChannels: [],
        ignoredRoles: [],
        filters: {
          spam: false,
          links: false,
          invites: false,
          caps: false
        },
        punishments: {
          warns: 3,
          timeout: 5,
          kick: 10,
          ban: 15
        }
      },
      levels: {
        enabled: false,
        announceChannel: null,
        roleRewards: {},
        xpRate: 1,
        xpTimeout: 60
      }
    })
  },
  permissions: {
    type: 'STRING',
    default: JSON.stringify({
      commands: {},
      roles: {
        admin: [],
        moderator: [],
        dj: []
      }
    })
  },
  customCommands: {
    type: 'STRING',
    default: '[]'
  },
  blacklist: {
    type: 'STRING',
    default: JSON.stringify({
      users: [],
      words: [],
      links: []
    })
  },
  logs: {
    type: 'STRING',
    default: JSON.stringify({
      mod: null,
      server: null,
      voice: null,
      messages: null
    })
  },
  lastUpdated: {
    type: 'DATE',
    default: () => new Date()
  }
});

// Pre-save hook para validación y conversión de JSON
guildConfigSchema.pre('save', async function(data) {
  // Validar estructura de settings
  try {
    const settings = typeof data.settings === 'string' 
      ? JSON.parse(data.settings) 
      : data.settings;

    // Validar canales
    if (settings.welcome.channel && !/^\d{17,19}$/.test(settings.welcome.channel)) {
      throw new Error('Invalid welcome channel ID');
    }

    // Validar color del embed
    if (!/^#[0-9A-F]{6}$/i.test(settings.welcome.embedColor)) {
      settings.welcome.embedColor = '#00ff00';
    }

    // Validar límites de automod
    if (settings.automod.punishments.warns < 0) settings.automod.punishments.warns = 3;
    if (settings.automod.punishments.timeout < 1) settings.automod.punishments.timeout = 5;

    // Convertir todos los campos de objeto a JSON
    const jsonFields = ['settings', 'permissions', 'customCommands', 'blacklist', 'logs'];
    for (const field of jsonFields) {
      if (typeof data[field] === 'object') {
        data[field] = JSON.stringify(data[field]);
      }
    }

    data.lastUpdated = new Date();
  } catch (error) {
    throw new Error(`Invalid guild config data: ${error.message}`);
  }
});

// Post-save hook para parsear JSON
guildConfigSchema.post('save', async function(data) {
  const jsonFields = ['settings', 'permissions', 'customCommands', 'blacklist', 'logs'];
  for (const field of jsonFields) {
    if (typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (error) {
        console.error(`Error parsing ${field}:`, error);
      }
    }
  }
});

// Método helper para verificar permisos
guildConfigSchema.methods.hasPermission = async function(userId, command) {
  const permissions = JSON.parse(this.permissions);
  const commandPerms = permissions.commands[command] || [];
  
  if (commandPerms.includes(userId)) return true;
  
  for (const [role, members] of Object.entries(permissions.roles)) {
    if (members.includes(userId) && commandPerms.includes(role)) {
      return true;
    }
  }
  
  return false;
};

module.exports = guildConfigSchema;
