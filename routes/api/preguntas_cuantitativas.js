const express = require("express");
const passport = require("passport");
const PreguntasCuantitativasService = require("../../services/preguntas_cuantitativas");
const TestsService = require("../../services/tests");

const { validation, validateArray, validateArrayCuantitativas } = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");

const {
  idSchema,
  createPreguntasCuantitativasSchema,
} = require("../../utils/schemas/preguntas_cuantitativas");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function preguntasCuantitativasApi(app) {
  const router = express.Router();
  app.use("/api/preguntas-desempeno/cuantitativas", router);

  const preguntasCuantitativasService = new PreguntasCuantitativasService(app);
  const testsService = new TestsService(app);
  //const respuestasService = new RespuestasService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:preguntas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await preguntasCuantitativasService.getIdsPreguntas(req.query);

      res.status(200).json({
        data: result,
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
      const pregunta = await preguntasCuantitativasService.getPregunta({ preguntaId });
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
    validation(createPreguntasCuantitativasSchema), async function(
    req,
    res,
    next
  ) {
    const { body: pregunta } = req;
    try {
      const createdPregunta = await preguntasCuantitativasService.createPregunta({ pregunta });

      res.status(201).json({
        data: createdPregunta.insertedId,
        message: "Pregunta creada."
      });
    } catch (err) {
      next(err);
    }
  });


  router.post("/tipo/:tipo/procesar/test/:_id_test/cargo/:_id_cargo",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:preguntas']),
    validateArrayCuantitativas(createPreguntasCuantitativasSchema,'preguntas'),
    async function(req,res,next) {
        try {
            const preguntas = req.body['preguntas']
            const { _id_test,tipo,_id_cargo } = req.params;
            await preguntasCuantitativasService.deletePreguntas({_id_test,tipo,_id_cargo})
            const createdPreguntas = await preguntasCuantitativasService.createPreguntas({ preguntas })
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
        const deletedPregunta = await preguntasCuantitativasService.deletePregunta({
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

module.exports = preguntasCuantitativasApi;
