const express = require("express");
const passport = require("passport");
const RespuestasService = require("../../services/respuestas");
//const RespuestasCualitativasService = require("../../services/respuestas_cualitativas");
const { validation, validateArray } = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");

const {
  idSchema,
  createRespuestasSchema,
  updateRespuestasSchema
} = require("../../utils/schemas/respuestas");

const {
  createRespuestasDesempenoSchema,
  updateRespuestasDesempenoSchema
} = require("../../utils/schemas/respuestas_desempeno");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);
const PreguntasService = require("../../services/preguntas");
const UsersService = require("../../services/users");
const TestsService = require("../../services/tests");

function respuestasApi(app) {
  const router = express.Router();
  app.use("/api/respuestas", router);

  const respuestasService = new RespuestasService(app);
  const preguntasService = new PreguntasService(app);
  const usersService = new UsersService(app);
  const testsService = new TestsService(app);
  //const respuestasCualitativasService = new RespuestasCualitativasService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:respuestas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await respuestasService.getRespuestas(req.query);
      res.status(200).json({
        data: result.data,
        totalRespuestas: result.total,
        totalPages: result.totalPages,
        message: "Respuestas listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/test/:_id_test/usuario/:_id_user", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:respuestas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const { _id_test,  _id_user} = req.params;
      const page = req.query.page - 1
      req.query.page = page + ''
      const result = await respuestasService.getRespuestas(Object.assign(req.query,{_id_test, _id_user}),{});
      const nuevoResult = await respuestasService.processRespuestasSegunTipo(result.data,preguntasService,usersService,testsService);
      res.status(200).json({
        data: result.data,
        totalRespuestas: result.total,
        totalPages: result.totalPages,
        message: "Respuestas listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:respuestaId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:respuestas']),
    async function(req, res, next) {
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
    const { respuestaId } = req.params;

    try {
      const respuesta = await respuestasService.getRespuesta({ respuestaId });
      res.status(200).json({
        data: respuesta,
        message: "Respuesta obtenida."
      });
    } catch (err) {
      next(err);
    }
  });

  

  router.post("/",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:respuestas']),
    validation(createRespuestasSchema), async function(
    req,
    res,
    next
  ) {
    const { body: respuesta } = req;
    try {
      const createdRespuesta = await respuestasService.createRespuesta({ respuesta });

      res.status(201).json({
        data: createdRespuesta.insertedId,
        message: "Respuesta creada."
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/desempeno",
  //router.post("/cualitativas",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:respuestas']),
    validation(createRespuestasDesempenoSchema), async function(
    req,
    res,
    next
  ) {
    const { body: respuesta } = req;
    try {
      const createdRespuesta = await respuestasService.createRespuesta({ respuesta });

      res.status(201).json({
        data: createdRespuesta.insertedId,
        message: "Respuesta creada."
      });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    "/desempeno/:respuestaId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:respuestas']),
    validation({ respuestaId: idSchema }, "params"),
    validation(updateRespuestasDesempenoSchema),
    async function(req, res, next) {
      const { respuestaId } = req.params;
      const { body: respuesta } = req;

      try {
        const updatedRespuesta = await respuestasService.updateRespuesta({
          respuestaId,
          respuesta
        });
        res.status(200).json({
          data: respuestaId,
          message: "Respuesta actualizada."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.put(
    "/valor/:respuestaId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:respuestas']),
    validation({ respuestaId: idSchema }, "params"),
    async function(req, res, next) {
      const { respuestaId } = req.params;
      const { body: respuesta } = req;

      try {
        const updatedRespuesta = await respuestasService.updateRespuesta({
          respuestaId,
          respuesta
        });
        res.status(200).json({
          data: respuestaId,
          message: "Respuesta actualizada."
        });
      } catch (err) {
        next(err);
      }
    }
  );



  router.post("/multiple",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:respuestas']),
    validateArray(createRespuestasSchema,'respuestas'), async function(
    req,
    res,
    next
  ) {
    const { body: {respuestas} } = req;
    try {
      const createdRespuestas = await respuestasService.createRespuestas({ respuestas });

      if (createdRespuestas){
        res.status(201).json({
          data: createdRespuestas,
          message: "Respuestas creadas."
        });
      }else{
        res.status(400).json({
          data: null,
          message: "No se pudo guardar respuestas."
        });
      }
    } catch (err) {
      next(err);
    }
  });


  router.post("/desempeno/multiple",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:respuestas']),
    validateArray(createRespuestasDesempenoSchema,'respuestas'), async function(
    req,
    res,
    next
  ) {
    const { body: {respuestas} } = req;
    try {
      const createdRespuestas = await respuestasService.createRespuestas({ respuestas });

      if (createdRespuestas){
        res.status(201).json({
          data: createdRespuestas,
          message: "Respuestas creadas."
        });
      }else{
        res.status(400).json({
          data: null,
          message: "No se pudo guardar respuestas."
        });
      }
    } catch (err) {
      next(err);
    }
  });


  

  
}

module.exports = respuestasApi;
