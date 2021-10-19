const express = require("express");
const passport = require("passport");
const SubdimensionesService = require("../../services/subdimensiones");
const {validation} = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");

const {
  idSchema,
  createSubdimensionesSchema,
  updateSubdimensionesSchema
} = require("../../utils/schemas/subdimensiones");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function subdimensionesApi(app) {
  const router = express.Router();
  app.use("/api/subdimensiones", router);

  const subdimensionesService = new SubdimensionesService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:subdimensiones']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await subdimensionesService.getSubdimensiones(req.query);

      res.status(200).json({
        data: result.data,
        totalSubdimensiones: result.total,
        totalPages: result.totalPages,
        message: "Subdimensiones listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/select/all", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:subdimensiones']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await subdimensionesService.getSubdimensionesAll({delete: false},{abreviatura:1,label:1})
      result.map(doc => {
        doc.value = doc.abreviatura
        doc.text = doc.label
        delete doc.abreviatura;
        delete doc.label
      })

      res.status(200).json({
        data: result,
        message: "Subdimensiones todas listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:subdimensionId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:subdimensiones']),
    async function(req, res, next) {
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
    const { subdimensionId } = req.params;

    try {
      const subdimension = await subdimensionesService.getSubdimension({ subdimensionId });

      res.status(200).json({
        data: subdimension,
        message: "Subdimension obtenida."
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:subdimensiones']),
    validation(createSubdimensionesSchema), async function(
    req,
    res,
    next
  ) {
    const { body: subdimension } = req;
    try {
      const createdSubdimension = await subdimensionesService.createSubdimension({ subdimension });

      res.status(201).json({
        data: createdSubdimension.insertedId,
        message: "Sudimension creada."
      });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    "/:subdimensionId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:subdimensiones']),
    validation({ subdimensionId: idSchema }, "params"),
    validation(updateSubdimensionesSchema),
    async function(req, res, next) {
      const { subdimensionId } = req.params;
      const { body: subdimension } = req;

      try {
        const updatedSubdimension = await subdimensionesService.updateSubdimension({
          subdimensionId,
          subdimension
        });
        res.status(200).json({
          data: subdimensionId,
          message: "Subdimensión actualizada."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    "/:subdimensionId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:subdimensiones']),
    async function(req, res, next) {
      const { subdimensionId } = req.params;

      try {
        const deletedSubdimension = await subdimensionesService.deleteSubdimension({
            subdimensionId
        });

        res.status(200).json({
          data: subdimensionId,
          message: "Subdimensión eliminada."
        });
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = subdimensionesApi;
