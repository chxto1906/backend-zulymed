const express = require("express");
const passport = require("passport");
const DepartamentosService = require("../../services/departamentos");
const EmpresasService = require("../../services/empresas");
const {validation} = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");
const filterByRol = require("../../utils/middlewares/filterByRol");

const {
  idSchema,
  createDepartamentosSchema,
  updateDepartamentosSchema
} = require("../../utils/schemas/departamentos");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function departamentosApi(app) {
  const router = express.Router();
  app.use("/api/departamentos", router);

  const departamentosService = new DepartamentosService(app);
  const empresasService = new EmpresasService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:departamentos']),
    filterByRol(),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await departamentosService.getDepartamentos(req.query);
      const nuevoResult = await departamentosService.processNuevoResultDepartamentos(result.data)
      res.status(200).json({
        data: nuevoResult,
        totalDepartamentos: result.total,
        totalPages: result.totalPages,
        message: "Departamentos listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/select/all", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:departamentos']),
    filterByRol(),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const query = Object.assign(req.query,{delete: false})
      const result = await departamentosService.getDepartamentosAll(query,{nombre:1})
      result.map(doc => {
        doc.value = doc._id
        doc.text = doc.nombre
        delete doc._id;
        delete doc.nombre
      })

      res.status(200).json({
        data: result,
        message: "Departamentos todos listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:departamentoId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:departamentos']),
    async function(req, res, next) {
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
    const { departamentoId } = req.params;

    try {
      const departamento = await departamentosService.getDepartamento({ departamentoId });

      res.status(200).json({
        data: departamento,
        message: "Departamento obtenido."
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:departamentos']),
    validation(createDepartamentosSchema), async function(
    req,
    res,
    next
  ) {
    const { body: departamento } = req;
    try {
      const createdDepartamento = await departamentosService.createDepartamento({ departamento });

      res.status(201).json({
        data: createdDepartamento.insertedId,
        message: "Departamento creado."
      });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    "/:departamentoId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:departamentos']),
    validation({ departamentoId: idSchema }, "params"),
    validation(updateDepartamentosSchema),
    async function(req, res, next) {
      const { departamentoId } = req.params;
      const { body: departamento } = req;

      try {
        const updatedDepartamento = await departamentosService.updateDepartamento({
          departamentoId,
          departamento
        });
        res.status(200).json({
          data: departamentoId,
          message: "Departamento actualizado."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    "/:departamentoId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:departamentos']),
    async function(req, res, next) {
      const { departamentoId } = req.params;

      try {
        const deletedDepartamento = await departamentosService.deleteDepartamento({
          departamentoId
        });

        res.status(200).json({
          data: departamentoId,
          message: "Departamento eliminado."
        });
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = departamentosApi;
