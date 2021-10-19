const express = require("express");
const passport = require("passport");
const SystemService = require("../../services/system");
const {validation} = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");

const {
  systemIdSchema,
  createSystemSchema,
  updateSystemSchema
} = require("../../utils/schemas/system");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function systemApi(app) {
  const router = express.Router();
  app.use("/api/system", router);
  const systemService = new SystemService();

  router.get("/", async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const system = await systemService.getSystem();

      res.status(200).json({
        data: system[0],
        message: "System config!"
      });
    } catch (err) {
      next(err);
    }
  });


  router.post("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['create:system']),
    validation(createSystemSchema), async function(
    req,
    res,
    next
  ) {
    const { body: system } = req;

    try {
      const createdSystem = await systemService.createSystem({ system });

      res.status(201).json({
        data: createdSystem,
        message: "system created"
      });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    "/:systemId",
    passport.authenticate("jwt", { session: false }),
    validation({ systemId: systemIdSchema }, "params"),
    validation(updateSystemSchema),
    async function(req, res, next) {
      const { systemId } = req.params;
      const { body: system } = req;

      try {
        const updatedSystem = await systemService.updateSystem({
          systemId,
          system
        });
        res.status(200).json({
          data: updatedSystem,
          message: "system updated"
        });
      } catch (err) {
        next(err);
      }
    }
  );

}

module.exports = systemApi;
