const express = require("express");
const passport = require("passport");
const PreguntasCualitativasGeneralesService = require("../../services/preguntas_cualitativas_generales");
const TestsService = require("../../services/tests");

const { validation, validateArray, validateArrayCualitativas } = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");

const {
  idSchema,
  createPreguntasCualitativasGeneralesSchema,
} = require("../../utils/schemas/preguntas_cualitativas_generales");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function preguntasCualitativasGeneralesApi(app) {
  const router = express.Router();
  app.use("/api/preguntas-desempeno/cualitativas/generales", router);

  const preguntasCualitativasGeneralesService = new PreguntasCualitativasGeneralesService(app);
  const testsService = new TestsService(app);
  //const respuestasService = new RespuestasService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:preguntas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      req.query = Object.assign(req.query,{tipo:'cualitativas_generales'})
      const result = await preguntasCualitativasGeneralesService.getPreguntas(req.query);

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
      const pregunta = await preguntasCualitativasGeneralesService.getPregunta({ preguntaId });
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
    validation(createPreguntasCualitativasGeneralesSchema), async function(
    req,
    res,
    next
  ) {
    const { body: pregunta } = req;
    try {
      const createdPregunta = await preguntasCualitativasGeneralesService.createPregunta({ pregunta });

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
    validateArrayCualitativas(createPreguntasCualitativasGeneralesSchema,'preguntas'),
    async function(req,res,next) {
        try {
            const preguntas = req.body['preguntas']
            const { _id_test } = req.params;
            const eliminadoPreguntasExistentes = await preguntasCualitativasGeneralesService.deletePreguntas({_id_test,tipo:'cualitativas_generales'})
            const createdPreguntas = await preguntasCualitativasGeneralesService.createPreguntas({ preguntas })
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

  

  /*router.put(
    "/:preguntaId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:preguntas']),
    validation({ preguntaId: idSchema }, "params"),
    validation(updatePreguntasSchema),
    async function(req, res, next) {
      const { preguntaId } = req.params;
      const { body: pregunta } = req;

      try {
        const updatedPregunta = await PreguntasCualitativasService.updatePregunta({
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
  );*/

  router.delete(
    "/:preguntaId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:preguntas']),
    validation({ preguntaId: idSchema }, "params"),
    async function(req, res, next) {
      const { preguntaId } = req.params;

      try {
        const deletedPregunta = await preguntasCualitativasGeneralesService.deletePregunta({
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

module.exports = preguntasCualitativasGeneralesApi;
