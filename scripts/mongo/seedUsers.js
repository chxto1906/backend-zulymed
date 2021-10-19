// DEBUG=app:* node scripts/mongo/seedUsers.js

const bcrypt = require('bcrypt');
const chalk = require('chalk');
const debug = require('debug')('app:scripts:users');
const MongoLib = require('../../lib/mongo');
const { config } = require('../../config/index');


const users = [
  {
    nombre: 'chxto',
    apellido: 'henry',
    email: 'chxto1906@gmail.com',
    password: config.defaultSuperadminPassword,
    rol: 'superadmin',
    delete: false
  },
  {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'jperez@gmail.com',
    password: config.defaultAdminPassword,
    rol: 'admin',
    delete: false
  },
  {
    nombre: 'Luis',
    apellido: 'Gómez',
    email: 'lgomez@gmail.com',
    password: config.defaultUserPassword,
    rol: 'user',
    delete: false
  }
];

async function createUser(mongoDB, user) {
  const { nombre, apellido, email, password, rol } = user;
  const hashedPassword = await bcrypt.hash(password, 10);

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
  try {
    const mongoDB = new MongoLib();

    const promises = users.map(async user => {
      const userId = await createUser(mongoDB, user);
      debug(chalk.green('User created with id:', userId));
    });

    await Promise.all(promises);
    return process.exit(0);
  } catch (error) {
    debug(chalk.red(error));
    process.exit(1);
  }
}

seedUsers();