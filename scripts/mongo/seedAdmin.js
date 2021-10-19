// DEBUG=app:* node scripts/mongo/seedUsers.js

const bcrypt = require('bcrypt');
const chalk = require('chalk');
const debug = require('debug')('app:scripts:users');
const MongoLib = require('../../lib/mongo');
const { config } = require('../../config/index');


const users = [
  {
    nombre: 'Zuly',
    apellido: 'Jimenez',
    email: 'zulyjim.04.11mel@gmail.com',
    password: 'superadmin',
    rol: 'superadmin',
    delete: false
  }
];

async function createUser(mongoDB, user) {
  const { nombre, apellido, email, password, rol } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('listo para guardar')
  const userId = await mongoDB.create('users', {
    nombre,
    apellido,
    email,
    password: hashedPassword,
    rol,
    'delete':false
  });

  return userId;
}

async function seedUsers() {
  console.log('entra en seedUsers')
  try {
    const mongoDB = new MongoLib();

    const promises = users.map(async user => {
      const userId = await createUser(mongoDB, user);
      console.log('creado')
      debug(chalk.green('User created with id:', userId));
    });

    await Promise.all(promises);
    return process.exit(0);
  } catch (error) {
    debug(chalk.red(error));
    console.log('error catch')
    console.dir(error)
    process.exit(1);
    
  }
}

seedUsers();