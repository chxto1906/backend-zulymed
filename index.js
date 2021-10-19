const express = require("express");
//const bodyParser = require("body-parser");
//const boom = require("boom");
const debug = require("debug")("app:server");
//const productsRouter = require("./routes/views/products");
//const productsApiRouter = require("./routes/api/products");
const systemApiRouter = require("./routes/api/system");
const empresasApiRouter = require("./routes/api/empresas");
const testsApiRouter = require("./routes/api/tests");
const subdimensionesApiRouter = require("./routes/api/subdimensiones");
const departamentosApiRouter = require("./routes/api/departamentos");
const cargosApiRouter = require("./routes/api/cargos");
const adminsApiRouter = require("./routes/api/admins")
const preguntasApiRouter = require("./routes/api/preguntas");
const preguntasPostCovidApiRouter = require("./routes/api/preguntas_postcovid");
const preguntasCuantitativasApiRouter = require("./routes/api/preguntas_cuantitativas");
const preguntasCualitativasGeneralesApiRouter = require("./routes/api/preguntas_cualitativas_generales");
const preguntasCualitativasEspecificasApiRouter = require("./routes/api/preguntas_cualitativas_especificas");
const preguntasCualitativasConocimientosApiRouter = require("./routes/api/preguntas_cualitativas_conocimientos");
const respuestasApiRouter = require("./routes/api/respuestas");
const reportesApiRouter = require("./routes/api/reportes");
const usersApiRouter = require("./routes/api/users");
const authApiRouter = require("./routes/api/auth");
const path = require("path");

const {
  logErrors,
  wrapErrors,
  errorHandler
} = require("./utils/middlewares/errorsHandlers");

const notFoundHandler = require("./utils/middlewares/notFoundHandler");

// app GLOBAL
app = express();

// body parser
app.use(express.json());

// static files
app.use("/public", express.static(path.join(__dirname, "public"),{
  setHeaders: function setHeaders(res, path, stat) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Add headers
// Solo para desarrollo
app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


//MONGODB 
const { MongoClient } = require("mongodb");
const { config } = require("./config");
const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const DB_NAME = config.dbName;
const MONGO_URI = `mongodb://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/?authSource=${DB_NAME}&retryWrites=true&w=majority`; // prettier-ignore
const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(error => {
  if (error) {
    console.log("Error Connect MongoDB: "+error)
  }
  console.log("Connected succesfully to mongo")
  app.locals.db = client.db(DB_NAME)
  //require ('./scripts/mongo/seedAdmin')

  // routes
  //app.use("/products", productsRouter);

  //productsApiRouter(app);
  systemApiRouter(app);
  empresasApiRouter(app);
  subdimensionesApiRouter(app);
  departamentosApiRouter(app);
  cargosApiRouter(app);
  adminsApiRouter(app);
  testsApiRouter(app);
  preguntasApiRouter(app);
  preguntasPostCovidApiRouter(app);
  preguntasCuantitativasApiRouter(app);
  preguntasCualitativasGeneralesApiRouter(app);
  preguntasCualitativasEspecificasApiRouter(app);
  preguntasCualitativasConocimientosApiRouter(app);
  respuestasApiRouter(app);
  reportesApiRouter(app);
  usersApiRouter(app);
  authApiRouter(app);
  //app.use("/api/auth", authApiRouter);

  // redirect
  /*app.get("/", function(req, res) {
    res.redirect("/products");
    console.log("/////");
  });*/

  /*app.use(function(req, res, next) {
    if (isRequestAjaxOrApi(req)) {
      const {
        output: { statusCode, payload }
      } = boom.notFound();
      res.status(statusCode).json(payload);
    }

    res.status(404).render("404");
  });*/

  // Catch 404
  app.use(notFoundHandler)

  // error handlers
  app.use(logErrors);
  app.use(wrapErrors);
  app.use(errorHandler);
  
  // server
  const server = app.listen(8000, function() {
    debug(`Listening http://localhost:${server.address().port}`);
  });

  



});

