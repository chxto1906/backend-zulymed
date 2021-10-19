const express = require("express");
const passport = require("passport");
const EmpresasService = require("../../services/empresas");
const {validation} = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");

const { ObjectId } = require("mongodb");

const multer  = require('multer')
const storage = multer.diskStorage(
  {
    destination: 'public/empresas_logos/',
    filename: function(req, file, cb) {
      cb(null, req.body.nombre + '-' +file.originalname)
    }
  }
)
const upload = multer({ storage })
const {
  empresasIdSchema,
  createEmpresasSchema,
  updateEmpresasSchema
} = require("../../utils/schemas/empresas");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function empresasApi(app) {
  const router = express.Router();
  app.use("/api/empresas", router);

  const empresasService = new EmpresasService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:empresas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await empresasService.getEmpresas(req.query);
      //console.dir(req.user.rol)
      res.status(200).json({
        data: result.data,
        totalEmpresas: result.total,
        totalPages: result.totalPages,
        message: "Empresas listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/select/all", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:empresas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      let result = []
      if (req.user.rol == 'admin'){
        result = await empresasService.getEmpresasAll({_id: ObjectId(req.user._id_empresa),delete: false},{_id:1,nombre:1})
      }else{
        result = await empresasService.getEmpresasAll({delete: false},{_id:1,nombre:1})
      }
      result.map(doc => {
        doc.value = doc._id
        doc.text = doc.nombre
        delete doc._id;
        delete doc.nombre
      })

      res.status(200).json({
        data: result,
        message: "Empresas todas listadas"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:empresaId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:empresas']),
    async function(req, res, next) {
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
    const { empresaId } = req.params;

    try {
      const empresa = await empresasService.getEmpresa({ empresaId });
      delete empresa.delete
      res.status(200).json({
        data: empresa,
        message: "Empresa obtenida."
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:empresas']),
    upload.single('image'),
    validation(createEmpresasSchema), async function(
    req,
    res,
    next
  ) {
    const { body: empresa } = req;
    try {
      const createdEmpresa = await empresasService.createEmpresa({ empresa });
      res.status(201).json({
        data: createdEmpresa.insertedId,
        message: "Empresa creada."
      });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    "/:empresaId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:empresas']),
    upload.single('image'),
    validation({ empresaId: empresasIdSchema }, "params"),
    validation(updateEmpresasSchema),
    async function(req, res, next) {
      const { empresaId } = req.params;
      const { body: empresa } = req;

      try {
        const updatedEmpresa = await empresasService.updateEmpresa({
          empresaId,
          empresa
        });
        res.status(200).json({
          data: empresaId,
          message: "Empresa actualizada."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    "/:empresaId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:empresas']),
    async function(req, res, next) {
      const { empresaId } = req.params;

      try {
        const deletedEmpresa = await empresasService.deleteEmpresa({
          empresaId
        });

        res.status(200).json({
          data: empresaId,
          message: "Empresa eliminada."
        });
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = empresasApi;
