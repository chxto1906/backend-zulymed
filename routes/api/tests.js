const express = require("express");
const passport = require("passport");
const TestsService = require("../../services/tests");
const PreguntasService = require("../../services/preguntas");
const RespuestasService = require("../../services/respuestas");
const UsersTestsService = require("../../services/users_tests");
const EmpresasService = require("../../services/empresas");
const CargosService = require("../../services/cargos");
const {validation} = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");
const filterByRol = require("../../utils/middlewares/filterByRol");

const {
  idSchema,
  createTestsSchema,
  updateTestsSchema
} = require("../../utils/schemas/tests");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);
const { ObjectId } = require("mongodb");

function testsApi(app) {
  const router = express.Router();
  app.use("/api/tests", router);

  const testsService = new TestsService(app);
  const preguntasService = new PreguntasService(app);
  const respuestasService = new RespuestasService(app);
  const usersTestsService = new UsersTestsService(app)
  const empresasService = new EmpresasService(app)
  const cargosService = new CargosService(app)

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:tests']),
    filterByRol(),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await testsService.getTests(req.query);
      const nuevoResult = await testsService.processNuevoResultTests(result.data,preguntasService,
        respuestasService,usersTestsService,empresasService)
      res.status(200).json({
        data: nuevoResult,
        totalTests: result.total,
        totalPages: result.totalPages,
        message: "Tests listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:testId/cargos/select/all", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:cargos']),
    filterByRol(),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const { testId } = req.params;
      const query = Object.assign(req.query,{delete: false})
      const cargos = await cargosService.getCargosAll(query,{nombre:1},{nombre:1})
      cargos.map(doc => {
        doc.value = doc._id
        doc.text = doc.nombre
        delete doc._id;
        delete doc.nombre
      })

      res.status(200).json({
        data: {
          cargos
        },
        message: "Cargos todos listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/select/all", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:tests']),
    filterByRol(),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await testsService.getTestsAll(req.query,{_id:1,nombre:1,_id_empresa:1})
      const nuevoResult = await testsService.processNuevoResultTestsSelectAll(result,empresasService)
      nuevoResult.map(doc => {
        doc.value = doc._id
        doc.text = doc.nombre
        delete doc._id;
        delete doc.nombre
        delete _id_empresa
      })

      res.status(200).json({
        data: result,
        message: "Evaluaciones todas listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:testId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:tests']),
    async function(req, res, next) {
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
    const { testId } = req.params;

    try {
      const test = await testsService.getTest( testId );
      res.status(200).json({
        data: test,
        message: "Test obtenido."
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:tests']),
    validation(createTestsSchema), async function(
    req,
    res,
    next
  ) {
    const { body: test } = req;
    try {
      const createdTest = await testsService.createTest({ test });

      res.status(201).json({
        data: createdTest.insertedId,
        message: "Test creado."
      });
    } catch (err) {
      next(err);
    }
  });


  router.post("/:testId/enviar",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:tests']),
    async function(
    req,
    res,
    next
  ) {
    console.log('ingresoo')
    const { testId } = req.params;
    try {
      const enviadoMails = await testsService.enviarEmailsUsuarios({ testId });
      if (enviadoMails){
        res.status(201).json({
          data: true,
          message: "Emails enviados."
        });
      }else{
        res.status(400).json({
          data: null,
          message: "No se pudo enviar emails."
        });
      }
    } catch (err) {
      res.status(400).json({
        data: null,
        message: "No se pudo enviar emails."
      });
    }
  });


  router.post("/:testId/usuario/:usuarioId/enviar",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:tests']),
    async function(
    req,
    res,
    next
  ) {
    const { testId, usuarioId } = req.params;
    try {
      const enviadoMail = await testsService.enviarEmailUsuario({ testId, usuarioId });
      if (enviadoMail){
        res.status(201).json({
          data: true,
          message: "Email enviado."
        });
      }else{
        res.status(400).json({
          data: null,
          message: "No se pudo enviar email."
        });
      }
    } catch (err) {
      next(err);
    }
  });


  router.put(
    "/:testId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:tests']),
    validation({ testId: idSchema }, "params"),
    validation(updateTestsSchema),
    async function(req, res, next) {
      const { testId } = req.params;
      const { body: test } = req;

      try {
        const updatedTest = await testsService.updateTest({
          testId,
          test
        });
        res.status(200).json({
          data: testId,
          message: "Test actualizado."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    "/:testId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:tests']),
    validation({ testId: idSchema }, "params"),
    async function(req, res, next) {
      const { testId } = req.params;

      try {
        const deletedTest = await testsService.deleteTest({
          testId
        });

        res.status(200).json({
          data: testId,
          message: "Test eliminado."
        });
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = testsApi;
