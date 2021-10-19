const express = require("express");
const passport = require("passport");
const PreguntasService = require("../../services/preguntas");
const TestsService = require("../../services/tests");
const RespuestasService = require("../../services/respuestas");
const { validation, validateArray } = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");

const {
  idSchema,
  createPreguntasSchema,
  updatePreguntasSchema
} = require("../../utils/schemas/preguntas");

const {
  createPreguntasDiagnosticoSchema
} = require("../../utils/schemas/preguntas_diagnostico");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function preguntasApi(app) {
  const router = express.Router();
  app.use("/api/preguntas", router);

  const preguntasService = new PreguntasService(app);
  const testsService = new TestsService(app);
  const respuestasService = new RespuestasService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:preguntas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await preguntasService.getPreguntas(req.query);

      res.status(200).json({
        data: result.data,
        totalPreguntas: result.total,
        totalPages: result.totalPages,
        message: "Preguntas listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/diagnostico", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:preguntas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await preguntasService.getPreguntas(req.query);

      res.status(200).json({
        data: result.data,
        totalPreguntas: result.total,
        totalPages: result.totalPages,
        message: "Preguntas listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:preguntaId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:preguntas']),
    async function(req, res, next) {
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
    const { preguntaId } = req.params;

    try {
      const pregunta = await preguntasService.getPregunta({ preguntaId });
      res.status(200).json({
        data: pregunta,
        message: "Pregunta obtenida."
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:preguntas']),
    validation(createPreguntasSchema), async function(
    req,
    res,
    next
  ) {
    const { body: pregunta } = req;
    try {
      const createdPregunta = await preguntasService.createPregunta({ pregunta });

      res.status(201).json({
        data: createdPregunta.insertedId,
        message: "Pregunta creada."
      });
    } catch (err) {
      next(err);
    }
  });


  router.post("/procesar/test/:_id_test",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:preguntas']),
    validateArray(createPreguntasSchema,'preguntas'),
    async function(req,res,next) {
        try {
            const preguntas = req.body['preguntas']
            const { _id_test } = req.params;
            const eliminadoPreguntasExistentes = await preguntasService.deletePreguntas({_id_test})
            const createdPreguntas = await preguntasService.createPreguntas({ preguntas })
            if (createdPreguntas){
                res.status(201).json({
                    data: preguntas,
                    message: "Preguntas creadas."
                });
            }else{
                res.status(400).json({
                    data: null,
                    message: "No se pudo procesar preguntas."
                });
            }
            
        } catch (err) {
            next(err);
        }
  });

  router.post("/diagnostico/seccion/:seccion/procesar/test/:_id_test",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:preguntas']),
    validateArray(createPreguntasDiagnosticoSchema,'preguntas'),
    async function(req,res,next) {
        try {
            const preguntas = req.body['preguntas']
            const { _id_test,seccion } = req.params;
            const eliminadoPreguntasExistentes = await preguntasService.deletePreguntas({_id_test,seccion})
            const createdPreguntas = await preguntasService.createPreguntasDiagnostico({ preguntas })
            if (createdPreguntas){
                res.status(201).json({
                    data: preguntas,
                    message: "Preguntas creadas."
                });
            }else{
                res.status(400).json({
                    data: null,
                    message: "No se pudo procesar preguntas."
                });
            }
            
        } catch (err) {
            next(err);
        }
  });

  router.put(
    "/:preguntaId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:preguntas']),
    validation({ preguntaId: idSchema }, "params"),
    validation(updatePreguntasSchema),
    async function(req, res, next) {
      const { preguntaId } = req.params;
      const { body: pregunta } = req;

      try {
        const updatedPregunta = await preguntasService.updatePregunta({
          preguntaId,
          pregunta
        });
        res.status(200).json({
          data: preguntaId,
          message: "Pregunta actualizada."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    "/:preguntaId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:preguntas']),
    validation({ preguntaId: idSchema }, "params"),
    async function(req, res, next) {
      const { preguntaId } = req.params;

      try {
        const deletedPregunta = await preguntasService.deletePregunta({
          preguntaId
        });

        res.status(200).json({
          data: preguntaId,
          message: "Pregunta eliminada."
        });
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = preguntasApi;
