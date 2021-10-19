const express = require("express");
const passport = require("passport");
const boom = require("boom");
const jwt = require("jsonwebtoken");
//const api = express.Router();
const ApiKeysService = require("../../services/apiKeys");
const UsersService = require("../../services/users");
const { validation } = require("../../utils/middlewares/validationHandler");

const { createUserSchema } = require("../../utils/schemas/users");

const { config } = require("../../config");

// Basic strategy
require("../../utils/auth/strategies/basic");




function authApi(app) {
  const router = express.Router();
  const apiKeysService = new ApiKeysService(app);
  const usersService = new UsersService(app);

  app.use("/api/auth", router);

  router.post("/sign-in", async function(req, res, next) {
    const { apiKeyToken } = req.body;

    if (!apiKeyToken){
      next(boom.unauthorized("apiKeyToken is required"));
    }
    
    passport.authenticate("basic", function(error, user) {
      try {
        if (error || !user) {
          //next(boom.unauthorized());
          return res.status(401).json({ error: "Unauthorized" });
        }
        req.login(user, { session: false }, async function(error) {
          if (error) {
            next(error);
          }

          const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });
          if (!apiKey){
            next(boom.unauthorized());
          }
          const { _id: id, nombre, apellido, email, rol} = user;
          const payload = { sub: id, nombre, apellido, email, scopes: apiKey.scopes };
          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: "1450m"
          });

          return res.status(200).json({ token, user: {id, nombre, apellido, email, rol} });
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  });


  router.post("/sign-up", validation(createUserSchema), async function(req, res, next) {
    const { body: user } = req;

    try {
      const createdUserId = await usersService.createUser({ user });

      res.status(201).json({ data: createdUserId, message: "User created" });
    } catch(error) {
      next(error);
    }
  });

  router.get("/yo", 
    passport.authenticate("jwt", { session: false }),
    async function(req, res, next) {
      res.status(200).json({ data: 'OK', message: "Logged" });
  });
}

module.exports = authApi;
