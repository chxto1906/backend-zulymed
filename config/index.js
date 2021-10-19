require("dotenv").config();

const config = {
  dev: process.env.NODE_ENV !== "production",
  port: process.env.PORT,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbName: process.env.DB_NAME,

  defaultSuperadminPassword: process.env.DEFAULT_SUPERADMIN_PASSWORD,
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
  defaultUserPassword: process.env.DEFAULT_USER_PASSWORD,

  authJwtSecret: process.env.AUTH_JWT_SECRET,

  superadminApiKeyToken: process.env.SUPERADMIN_API_KEY_TOKEN,
  adminApiKeyToken: process.env.ADMIN_API_KEY_TOKEN,
  userApiKeyToken: process.env.USER_API_KEY_TOKEN
  
};

module.exports = { config };
