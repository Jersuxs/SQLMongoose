const { SlashCommandBuilder } = require('discord.js');
const { Economy } = require('../models');

const SHOP_ITEMS = {
  sword: { name: 'Sword', price: 1000, type: 'weapon', damage: 50 },
  shield: { name: 'Shield', price: 800, type: 'armor', defense: 30 },
  potion: { name: 'Health Potion', price: 100, type: 'consumable', heal: 50 }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View or buy items from the shop')
    .addSubcommand(sub => 
      sub.setName('view')
        .setDescription('View available items'))
    .addSubcommand(sub =>
      sub.setName('buy')
        .setDescription('Buy an item')
        .addStringOption(opt =>
          opt.setName('item')
            .setDescription('Item to buy')
            .setRequired(true)
            .addChoices(
              ...Object.entries(SHOP_ITEMS).map(([id, item]) => 
                ({ name: item.name, value: id }))
            ))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'view') {
      const embed = {
        title: '🏪 Shop',
        description: 'Available items:',
        fields: Object.entries(SHOP_ITEMS).map(([id, item]) => ({
          name: `${item.name} - $${item.price}`,
          value: `Type: ${item.type}\n${Object.entries(item)
            .filter(([k]) => !['name', 'price', 'type'].includes(k))
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n')}`
        }))
      };
      
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (subcommand === 'buy') {
      const itemId = interaction.options.getString('item');
      const item = SHOP_ITEMS[itemId];
      
      try {
        const user = await Economy.findOne({ userId: interaction.user.id });
        if (!user) throw new Error('You need to create an account first! Use /start');
        if (user.wallet < item.price) throw new Error(`You need ${item.price - user.wallet} more coins!`);

        const inventory = JSON.parse(user.inventory);
        inventory.items.push({
          id: itemId,
          ...item,
          obtainedAt: new Date()
        });

        await Economy.update(
          { userId: interaction.user.id },
          {
            $inc: { wallet: -item.price },
            $set: { inventory: JSON.stringify(inventory) }
          }
        );

        await interaction.reply(`Successfully bought ${item.name} for $${item.price}!`);
      } catch (error) {
        await interaction.reply({ content: error.message, ephemeral: true });
      }
    }
  }
};
