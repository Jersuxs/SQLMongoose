const sqlmongoose = require('sqlmongoose');

// Conectar a la base de datos
async function init() {
  await sqlmongoose.connect('myapp.db');
  
  // Los modelos se cargarán automáticamente
  require('./schemas/EconomySchema');
  
  // Ya puedes usar los modelos en toda tu aplicación
  const Economy = sqlmongoose.model('Economy');
}

init().catch(console.error);

// Uso en comandos
async function balanceCommand(userId) {
  let user = await Economy.findOne({ userId });
  
  if (!user) {
    user = await Economy.create({
      userId,
      money: 1000, // Dinero inicial
      bank: 0
    });
  }

  return user;
}

// Ejemplo de transacción
async function transferMoney(fromId, toId, amount) {
  const fromUser = await Economy.findOne({ userId: fromId });
  const toUser = await Economy.findOne({ userId: toId });

  if (!fromUser || !toUser) {
    throw new Error('Usuario no encontrado');
  }

  if (fromUser.money < amount) {
    throw new Error('Dinero insuficiente');
  }

  await Economy.update(
    { userId: fromId },
    { $inc: { money: -amount } }
  );

  await Economy.update(
    { userId: toId },
    { $inc: { money: amount } }
  );
}

// Ejemplo de consulta avanzada
async function getRichest() {
  return await Economy.find({}, {
    orderBy: {
      money: 'DESC'
    },
    limit: 10
  });
}
