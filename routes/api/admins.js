const express = require("express");
const passport = require("passport");
const AdminsService = require("../../services/admins");
const EmpresasService = require("../../services/empresas");
const {validation} = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");

const {
  idSchema,
  createAdminsSchema,
  updateAdminsSchema
} = require("../../utils/schemas/admins");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);

function adminsApi(app) {
  const router = express.Router();
  app.use("/api/admins", router);

  const adminsService = new AdminsService(app);
  const empresasService = new EmpresasService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:admins']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await adminsService.getAdmins(req.query);
      const nuevoResult = await adminsService.processNuevoResultAdmins(result.data,empresasService)

      res.status(200).json({
        data: nuevoResult,
        totalAdmins: result.total,
        totalPages: result.totalPages,
        message: "Admins listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/select/all", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:admins']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const query = Object.assign(req.query,{delete: false})
      const result = await adminsService.getCargosAll(query,{nombre:1},{nombre:1})
      result.map(doc => {
        doc.value = doc._id
        doc.text = doc.nombre
        delete doc._id;
        delete doc.nombre
      })

      res.status(200).json({
        data: result,
        message: "Admins todos listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:adminId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:admins']),
    async function(req, res, next) {
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
    const { adminId } = req.params;

    try {
      const admin = await adminsService.getAdmin({ adminId });
      admin.password = ''
      res.status(200).json({
        data: admin,
        message: "Admin obtenido."
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['create:admins']),
    validation(createAdminsSchema), async function(
    req,
    res,
    next
  ) {
    const { body: admin } = req;
    try {
      const createdAdmin = await adminsService.createAdmin({ admin });

      res.status(201).json({
        data: createdAdmin.insertedId,
        message: "Admin creado."
      });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    "/:adminId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:admins']),
    validation({ adminId: idSchema }, "params"),
    validation(updateAdminsSchema),
    async function(req, res, next) {
      const { adminId } = req.params;
      const { body: admin } = req;

      try {
        const updatedAdmin = await adminsService.updateAdmin({
          adminId,
          admin
        });
        res.status(200).json({
          data: adminId,
          message: "Admin actualizado."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete(
    "/:adminId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:admins']),
    async function(req, res, next) {
      const { adminId } = req.params;

      try {
        const deletedAdmin = await adminsService.deleteAdmin({
          adminId
        });

        res.status(200).json({
          data: adminId,
          message: "Admin eliminado."
        });
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = adminsApi;
