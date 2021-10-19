const express = require("express");
const ReportesService = require("../../services/reportes");
const ReportesPostCovidService = require("../../services/reportes_postcovid");
const ReportesDesempenoService = require("../../services/reportes_desempeno");
const passport = require("passport");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");
//const host = "https://api.externaevaluaciones.com"
const host = "http://localhost:8000"

function reportesApi(app) {
  const router = express.Router();
  app.use("/api/reportes", router);
  const reportesService = new ReportesService(app);
  const reportesPostCovidService = new ReportesPostCovidService(app);
  const reportesDesempenoService = new ReportesDesempenoService(app);


  router.post("/clima/datos-origen",
    //passport.authenticate("jwt", { session: false }),
    /*scopesValidationHandler(['execute:reportes']),*/ async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const data = await reportesService.generateDatosOrigenClima(datos,host,res)
    } catch (err) {
      next(err);
    }
  });


  router.post("/clima/graficos",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const data = await reportesService.generateDataClimaGraficos(datos)
        res.status(201).json({
            data: data,
            message: "Datos para gráficos de reporte Clima Laboral."
        });
    } catch (err) {
      next(err);
    }
  });

  router.post("/clima/pdf",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const data = await reportesService.generatePdfClima(datos,res,host)
    } catch (err) {
      next(err);
    }
  });

  router.post("/postcovid/graficos",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const data = await reportesPostCovidService.generateDataPostCovidGraficos(datos)
        res.status(201).json({
            data: data,
            message: "Datos para gráficos de reporte PostCovid."
        });
    } catch (err) {
      next(err);
    }
  });

  router.post("/postcovid/pdf",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const data = await reportesPostCovidService.generatePdfPostCovid(datos,res,host)
    } catch (err) {
      next(err);
    }
  });

  router.post("/eliminarrespuestas", async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const data = await reportesService.procesoEliminarRespuestas(datos)
        res.status(201).json({
            data: "OK",
            message: "Eliminadas preguntas."
        });
    } catch (err) {
      next(err);
    }
  })

  router.post("/usuariosportest", async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const usuarios = await reportesService.usuariosPorTests(datos)
        res.status(201).json({
            data: usuarios,
            message: "Usuarios listados."
        });
    } catch (err) {
      next(err);
    }
  })


  router.post("/diagnostico/graficos",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const data = await reportesService.generateDataDiagnosticoGraficos(datos)
        res.status(201).json({
            data: data,
            message: "Datos para gráficos de reporte Diagnóstico Motivacional."
        });
    } catch (err) {
      next(err);
    }
  });

  router.post("/diagnostico/pdf",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(5000000);
        const data = await reportesService.generatePdfDiagnostico(datos,res,host)
    } catch (err) {
      next(err);
    }
  });

  router.post("/desempeno/especifico/pdf",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(5000000);
        const data = await reportesDesempenoService.generateDataDesempenoEspecifico(datos)
        datos.data = data
        await reportesDesempenoService.generatePdfEspecifico(datos,res,host)
    } catch (err) {
      next(err);
    }
  });

  router.post("/desempeno/general/graficos",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(500000);
        const data = await reportesDesempenoService.generateDataDesempenoGeneral(datos)
        res.status(201).json({
            data: data,
            message: "Datos para gráficos de reporte Desempeño."
        });
    } catch (err) {
      next(err);
    }
  });

  router.post("/desempeno/general/pdf",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['execute:reportes']), async function(req,res,next) {
    const { body: datos } = req;
    try {
        req.setTimeout(5000000);
        const data = await reportesDesempenoService.generatePdfDesempenoGeneral(datos,res,host)
    } catch (err) {
      next(err);
    }
  });

  
}

module.exports = reportesApi;
