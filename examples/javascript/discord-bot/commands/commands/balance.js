const sqlmongoose = require('sqlmongoose');
const Economy = sqlmongoose.model('Economy');

module.exports = {
  name: 'balance',
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    let userEconomy = await Economy.findOne({ 
      userId: targetUser.id 
    });

    if (!userEconomy) {
      userEconomy = await Economy.create({
        userId: targetUser.id,
        money: 0,
        bank: 0
      });
    }

    // Ejemplo de uso de $inc
    await Economy.update(
      { userId: targetUser.id },
      { $inc: { money: 100 } }
    );

    return userEconomy;
  }
};
