const express = require("express");
const passport = require("passport");
const CargosService = require("../../services/cargos");
const {validation} = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");
const filterByRol = require("../../utils/middlewares/filterByRol");

const {
  idSchema,
  createCargosSchema,
  updateCargosSchema
} = require("../../utils/schemas/cargos");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function cargosApi(app) {
  const router = express.Router();
  app.use("/api/cargos", router);

  const cargosService = new CargosService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:cargos']),
    filterByRol(),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await cargosService.getCargos(req.query);
      const nuevoResult = await cargosService.processNuevoResultCargos(result.data)

      res.status(200).json({
        data: nuevoResult,
        totalCargos: result.total,
        totalPages: result.totalPages,
        message: "Cargos listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/select/all", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:cargos']),
    filterByRol(),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const query = Object.assign(req.query,{delete: false})
      const result = await cargosService.getCargosAll(query,{nombre:1},{nombre:1})
      result.map(doc => {
        doc.value = doc._id
        doc.text = doc.nombre
        delete doc._id;
        delete doc.nombre
      })

      res.status(200).json({
        data: result,
        message: "Cargos todos listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:cargoId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:cargos']),
    async function(req, res, next) {
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
    const { cargoId } = req.params;

    try {
      const cargo = await cargosService.getCargo({ cargoId });

      res.status(200).json({
        data: cargo,
        message: "Cargo obtenido."
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:cargos']),
    validation(createCargosSchema), async function(
    req,
    res,
    next
  ) {
    const { body: cargo } = req;
    try {
      const createdCargo = await cargosService.createCargo({ cargo });

      res.status(201).json({
        data: createdCargo.insertedId,
        message: "Cargo creado."
      });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    "/:cargoId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:cargos']),
    validation({ cargoId: idSchema }, "params"),
    validation(updateCargosSchema),
    async function(req, res, next) {
      const { cargoId } = req.params;
      const { body: cargo } = req;

      try {
        const updatedCargo = await cargosService.updateCargo({
          cargoId,
          cargo
        });
        res.status(200).json({
          data: cargoId,
          message: "Cargo actualizado."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    "/:cargoId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:cargos']),
    async function(req, res, next) {
      const { cargoId } = req.params;

      try {
        const deletedCargo = await cargosService.deleteCargo({
          cargoId
        });

        res.status(200).json({
          data: cargoId,
          message: "Cargo eliminado."
        });
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = cargosApi;
