const bcrypt = require("bcrypt");
const chalk = require("chalk");
const MongoLib = require("../../lib/mongo");
const { config } = require("../../config");

function buildAdminUser(password) {
  return {
    nombre:   config.authAdminUsername,
    apellido: config.authAdminUsername,
    username: config.authAdminUsername,
    email:    config.authAdminEmail,
    password,
    rol:      'superadmin', //superadmin, admin, default
    delete:   false           
  };
}

async function hasAdminUser(mongoDB) {
  const adminUser = await mongoDB.getAll("users", {
    username: config.authAdminUsername
  });

  return adminUser && adminUser.length;
}

async function createAdminUser(mongoDB) {
  const hashedPassword = await bcrypt.hash(config.authAdminPassword, 10);
  const userId = await mongoDB.create("users", buildAdminUser(hashedPassword));
  return userId;
}

async function seedAdmin() {
  try {
    const mongoDB = new MongoLib();

    if (await hasAdminUser(mongoDB)) {
      console.log(chalk.yellow("Admin user already exists"));
      return process.exit(1);
    }

    const adminUserId = await createAdminUser(mongoDB);
    console.log(chalk.green("Admin user created with id:", adminUserId));
    return process.exit(0);
  } catch (error) {
    console.log(chalk.red(error));
    process.exit(1);
  }
}

seedAdmin();
