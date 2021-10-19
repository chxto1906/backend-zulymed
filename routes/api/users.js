const express = require("express");
const passport = require("passport");
const UsersService = require("../../services/users");
const PreguntasService = require("../../services/preguntas");
const PreguntasCuantitativasService = require("../../services/preguntas_cuantitativas");
const PreguntasCualitativasGeneralesService = require("../../services/preguntas_cualitativas_generales");
const PreguntasCualitativasEspecificasService = require("../../services/preguntas_cualitativas_especificas");
const RespuestasService = require("../../services/respuestas");
const RespuestasCualitativasService = require("../../services/respuestas_cualitativas");
const EmpresasService = require("../../services/empresas");
const TestsService = require("../../services/tests");
const UsersTestsService = require("../../services/users_tests");
const { validationSub, validateArrayUsers, validation } = require("../../utils/middlewares/validationHandler");
const scopesValidationHandler = require("../../utils/middlewares/scopesValidationHandler");
const { ObjectId } = require("mongodb");

const {
  idSchema,
  createUserSchema,
  updateUserSchema,
} = require("../../utils/schemas/users");

const {
  updateUserSimpleSchema
} = require("../../utils/schemas/user_simple")

const {
  updateUserTestsSchema,
} = require("../../utils/schemas/users_tests");

const {
  updateUserAsignacionesSchema
} = require("../../utils/schemas/user_asignaciones");

// JWT strategy
require("../../utils/auth/strategies/jwt");

const cacheResponse = require("../../utils/cacheResponse");
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require(
  "../../utils/time"
);


const processFecha = function(valor) {
  const date = new Date(valor)
  const year = date.getFullYear()
  let month = date.getMonth()+1
  let dt = date.getDate()

  if (dt < 10) {
    dt = '0' + dt
  }
  if (month < 10) {
    month = '0' + month
  }

  return year+'-' + month + '-'+dt
}


const processUsuario = function(usuario,userTest) {



  return {
    usuario:{
      _id: usuario._id || '',
      cedula: usuario.cedula || '',
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      fecha_nacimiento: usuario.fecha_nacimiento ? processFecha(usuario.fecha_nacimiento) : "",
      sexo: usuario.sexo || ''
    },
    usuarioTest: {
      _id_test: userTest._id_test || '',
      _id_usuario: userTest._id_usuario || '',
      _id_empresa: userTest._id_empresa || '',
      _id_departamento: userTest._id_departamento || '',
      _id_cargo: userTest._id_cargo || '',
      antiguedad: userTest.antiguedad || '',
    }
  }
}

const procesarPreguntasCualitativas = async function(res,infoTest,userId,req,usersTestsService,testId,obj_ids,preguntasService,empresasService,usersService,totalAnterior) {
  const limit = 4
  queryAux = {
    _id_usuario: String(userId),
    _id_test: String(infoTest._id),
    $or:[
      {"_ids_jefes.value":String(req.user._id)},
      {"_ids_pares.value":String(req.user._id)},
      {"_ids_subordinados.value":String(req.user._id)}
    ]
  }
  let userTest = await usersTestsService.getUserTest(queryAux)
  const empresaInfo = await empresasService.getEmpresa({empresaId: infoTest._id_empresa})
  if (userTest && Object.keys(userTest).length > 0 && userTest.constructor === Object){
    /*******Competencias Generales y Específicas */
    const ID_CARGO = userTest._id_cargo;
    let origen = 'generales'
    let auxQuery = Object.assign(req.query,{_id_test: testId,tipo:'cualitativas_generales',_id: {$nin: obj_ids}})
    preguntasPendientes = await preguntasService.findPreguntas(auxQuery,{orden:1},{},limit)
    if (preguntasPendientes.length == 0){
      auxQuery = Object.assign(req.query,{_id_test: testId,tipo:'cualitativas_especificas',_id_cargo:ID_CARGO,_id: {$nin: obj_ids}})
      preguntasPendientes = await preguntasService.findPreguntas(auxQuery,{orden:1},{},limit)
      origen = 'especificas'
      if (preguntasPendientes.length == 0){
        auxQuery = Object.assign(req.query,{_id_test: testId,tipo:'cualitativas_conocimientos',_id_cargo:ID_CARGO,_id: {$nin: obj_ids}})
        preguntasPendientes = await preguntasService.findPreguntas(auxQuery,{orden:1},{},limit)
        origen = 'conocimientos'
      }
    }
    
    
    let totalPreguntas = totalAnterior
    totalPreguntas = totalAnterior + await preguntasService.count({_id_test: testId,tipo:'cualitativas_generales',delete: false});
    totalPreguntas = totalPreguntas + await preguntasService.count({_id_test: testId,_id_cargo:ID_CARGO,tipo:'cualitativas_especificas',delete: false});
    totalPreguntas = totalPreguntas + await preguntasService.count({_id_test: testId,_id_cargo:ID_CARGO,tipo:'cualitativas_conocimientos',delete: false});
    
    let usuario = await usersService.getUserById(req.user._id,{
      nombre:1,apellido:1,email:1,
    })
    const query = {_id_test: testId, _id_usuario: String(req.user._id), _id_empresa: infoTest._id_empresa}
    userTest = await usersTestsService.getUserTest(query)
    usuario = processUsuario(usuario,userTest)
    let usuarioEvaluar = await usersService.getUserById(userId,{nombre:1,apellido:1,email:1})
    const data = {
      test: infoTest,
      preguntas: preguntasPendientes || [],
      empresa: empresaInfo,
      respondidas: obj_ids.length,
      total: totalPreguntas,
      usuario: usuario['usuario'],
      usuarioTest: usuario['usuarioTest'],
      usuarioAEvaluar: usuarioEvaluar,
      _id_usuario_test: userTest._id,
      origen
    }
    res.status(200).json({
        data: data,
        message: "Pregunta pendiente"
    });

    /******************************************** */
  }else{
    let usuario = await usersService.getUserById(req.user._id,{
      nombre:1,apellido:1,email:1,
    })
    const query = {_id_test: testId, _id_usuario: String(req.user._id), _id_empresa: infoTest._id_empresa}
    userTest = await usersTestsService.getUserTest(query)
    usuario = processUsuario(usuario,userTest)
    let totalPreguntas = totalAnterior;
    let usuarioEvaluar = await usersService.getUserById(userId,{nombre:1,apellido:1,email:1})
    const data = {
      test: infoTest,
      preguntas: [],
      empresa: empresaInfo,
      respondidas: obj_ids.length,
      total: totalPreguntas,
      usuario: usuario['usuario'],
      usuarioTest: usuario['usuarioTest'],
      usuarioAEvaluar: usuarioEvaluar,
      _id_usuario_test: userTest._id,
      origen:'especificas'
    }
    res.status(200).json({
        data: data,
        message: "Pregunta pendiente"
    });
  }
}

function usersApi(app) {
  const router = express.Router();
  app.use("/api/usuarios", router);

  const usersService = new UsersService(app);
  const testsService = new TestsService(app);
  const preguntasService = new PreguntasService(app);
  const preguntasCuantitativasService = new PreguntasCuantitativasService(app);
  const preguntasCualitativasGeneralesService = new PreguntasCualitativasGeneralesService(app);
  const preguntasCualitativasEspecificasService = new PreguntasCualitativasEspecificasService(app);
  const respuestasService = new RespuestasService(app);
  const respuestasCualitativasService = new RespuestasCualitativasService(app);
  const empresasService = new EmpresasService(app);
  const usersTestsService = new UsersTestsService(app);

  router.get("/", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:users']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const result = await usersService.getUsuarios(req.query)
      const infoTest = await testsService.getTest(req.query._id_test)

      const cantidadPreguntas = await preguntasService.count({_id_test: String(req.query._id_test),delete: false})
      const cantidadUsersTest = await usersTestsService.count({_id_test: req.query._id_test})
      const cantidadPreguntasUsuarios = cantidadPreguntas * cantidadUsersTest;
      const preguntasRespondidasArray = await respuestasService
                  .getIds({_id_test: String(req.query._id_test)},{_id_pregunta:1})
      const cantidadRespondidas = preguntasRespondidasArray.length
      const porcentajeTotal = cantidadRespondidas * 100 / cantidadPreguntasUsuarios
      const nuevoResult = await usersService.processNuevoResultUsers(result.data,preguntasService,respuestasService,usersTestsService,empresasService,testsService,infoTest)

      res.status(200).json({
        data: nuevoResult,
        totalUsuarios: result.total,
        totalPages: result.totalPages,
        porcentajeTotal: Math.floor(porcentajeTotal),
        message: "Usuarios listados"
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/evaluaciones", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:users','read:tests']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
        //let usuario = await usersService.getUserById(req.user._id,{tests: 1})
        //let testIds = usuario.tests;
        const tests = await testsService.getTestsAll({tipo:'desempeno'},{_id:1})
        const obj_ids = tests.map(function(val) {
          return String(val._id)
        }) || []
        const queryAux = Object.assign(req.query,
          {$or:[
            {$and:[
              {_id_usuario: String(req.user._id)},
              {_id_test:{$nin: obj_ids}}
            ]},
            {"_ids_jefes.value":String(req.user._id)},
            {"_ids_pares.value":String(req.user._id)},
            {"_ids_subordinados.value":String(req.user._id)},
            {"_ids_quien_le_califica.value":String(req.user._id)}
          ]})
        const result = await usersTestsService.getUsersTests(queryAux)
        const nuevoResult = await usersService.processNuevoResult(result.data,preguntasService,
                                  empresasService,respuestasService,testsService,req.user._id)
        res.status(200).json({
            data: nuevoResult,
            totalEvaluaciones: result.total,
            totalPages: result.totalPages,
            message: "Evaluaciones listadas"
        });
    } catch (err) {
      next(err);
    }
  });

  router.get("/evaluaciones/cuantitativas", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:users','read:tests']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
        const queryAux = Object.assign(req.query,{"_ids_quien_le_califica.value": String(req.user._id),delete:false})
        const result = await usersTestsService.getUsersTests(queryAux)
        const nuevoResult = await usersService.processNuevoResultCualitativas(result.data,
                                  preguntasCuantitativasService,
                                  respuestasService,
                                  empresasService,testsService,req.user._id)
        res.status(200).json({
            data: nuevoResult,
            totalEvaluaciones: result.total,
            totalPages: result.totalPages,
            message: "Evaluaciones listadas"
        });
    } catch (err) {
      next(err);
    }
  });

  router.get("/preguntas-pendientes/test/:testId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:users','read:tests','read:preguntas','read:respuestas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      let limit = 6
      const { testId } = req.params;
      const infoTest = await testsService.getTest(testId)


      const preguntasRespondidasArray = await respuestasService
            .getIds({_id_test: String(testId), _id_user: String(req.user._id)},{_id_pregunta:1}) 
      const obj_ids = preguntasRespondidasArray.map(function(val) {
        return ObjectId(val._id_pregunta)
      }) || []
      if (infoTest.tipo == 'clima_laboral' || infoTest.tipo == 'desempeno' || infoTest.tipo == 'postcovid')
        delete req.query.seccion

      if (infoTest.tipo == 'diagnostico_motivacional' || infoTest.tipo == 'desempeno'){
        limit = 4
      }

      const auxQuery = Object.assign(req.query,{_id_test: testId,_id: {$nin: obj_ids}})

      let preguntasPendientes = null;
      let origen = 'generales'
      if (infoTest.tipo == 'desempeno'){
        preguntasPendientes = await preguntasCualitativasGeneralesService.findPreguntas(auxQuery,{orden:1},{},limit)
        if (preguntasPendientes.length == 0){
          preguntasPendientes = await preguntasCualitativasEspecificasService.findPreguntas(auxQuery,{orden:1},{},limit)
          origen = 'especificas'
        }
      }else{
        preguntasPendientes = await preguntasService.findPreguntas(auxQuery,{orden:1},{},limit)
      }
      
      const empresaInfo = await empresasService.getEmpresa({empresaId: infoTest._id_empresa})
      let totalPreguntas = 0;
      if (infoTest.tipo == 'desempeno'){
        totalPreguntas = await preguntasCualitativasGeneralesService.count({_id_test: testId,delete: false});
        totalPreguntas = totalPreguntas + await preguntasCualitativasEspecificasService.count({_id_test: testId,delete: false});
      }else{
        totalPreguntas = await preguntasService.count({_id_test: testId,delete: false});
      }
      
      let usuario = await usersService.getUserById(req.user._id,{
        nombre:1,apellido:1,email:1,
      })
      const query = {_id_test: testId, _id_usuario: String(req.user._id), _id_empresa: infoTest._id_empresa}
      let userTest = await usersTestsService.getUserTest(query)
      usuario = processUsuario(usuario,userTest)
      const data = {
        test: infoTest,
        preguntas: preguntasPendientes || [],
        empresa: empresaInfo,
        respondidas: obj_ids.length,
        total: totalPreguntas,
        usuario: usuario['usuario'],
        usuarioTest: usuario['usuarioTest'],
        _id_usuario_test: userTest._id,
        origen
      }
      res.status(200).json({
          data: data,
          message: "Pregunta pendiente"
      });

    } catch (err) {
      next(err);
    }
  });




  router.get("/preguntas-pendientes/test/:testId/usuario/:userId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:users','read:tests','read:preguntas','read:respuestas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      const { testId, userId } = req.params;
      const infoTest = await testsService.getTest(testId)
      /*let preguntasRespondidasArray = await respuestasService
            .getIds({_id_test: String(testId), _id_user: String(userId)},{_id_pregunta:1}) */

      const preguntasRespondidasArray = await respuestasService.getIds({_id_test: String(testId), _id_user: String(userId),_id_users_calificaron:String(req.user._id)},{_id_pregunta:1})

      const obj_ids = preguntasRespondidasArray.map(function(val) {
        return ObjectId(val._id_pregunta)
      }) || []
      delete req.query.seccion
      let queryAux = {
        _id_usuario: String(userId),
        _id_test: String(infoTest._id),
        "_ids_quien_le_califica.value":String(req.user._id)
      }
      let userTest = await usersTestsService.getUserTest(queryAux)
      if (userTest && Object.keys(userTest).length > 0 && userTest.constructor === Object){
        /******** KPIS, DESEMPENO */
        //console.log('cuantitativas')
        const ID_CARGO = userTest._id_cargo
        let preguntas = {
          kpis: [],
          desempeno: []
        }
  
        let preguntasKpisArray = await preguntasService.getIdsPreguntas({_id_test: String(testId),tipo:'kpis',_id_cargo:ID_CARGO,delete:false})
        let preguntasDesempenoArray = await preguntasService.getIdsPreguntas({_id_test: String(testId),tipo:'desempeno',_id_cargo:ID_CARGO,delete:false})
  
        for (let index = 0; index < preguntasKpisArray.length; index++) {
          let element = preguntasKpisArray[index];
          let respuesta = await respuestasService.getOne({_id_user:String(userId),_id_test: String(testId),_id_users_calificaron:String(req.user._id),_id_pregunta:String(element._id)}) 
          if (Object.keys(respuesta).length === 0){
            respuesta = {
              _id: null,
              _id_pregunta: String(element._id),
              _id_user: String(userId),
              _id_users_calificaron: [],
              _id_test: String(testId),
              value: null,
              delete: false
            }
          }
          if (!respuesta._id) {
            element["respuesta"] = respuesta
            preguntas["kpis"].push(element)
          }
        }
  
        for (let index = 0; index < preguntasDesempenoArray.length; index++) {
          let element = preguntasDesempenoArray[index];
          let respuesta = await respuestasService.getOne({_id_user:String(userId),_id_test: String(testId),_id_users_calificaron:String(req.user._id),_id_pregunta:String(element._id)}) 
          if (Object.keys(respuesta).length === 0){
            respuesta = {
              _id: null,
              _id_pregunta: String(element._id),
              _id_user: String(userId),
              _id_users_calificaron: [],
              _id_test: String(testId),
              value: null,
              delete: false
            }
          }
          if (!respuesta._id) {
            element["respuesta"] = respuesta
            preguntas["desempeno"].push(element)
          }
        }
        const empresaInfo = await empresasService.getEmpresa({empresaId: infoTest._id_empresa})

        let usuario = await usersService.getUserById(req.user._id,{
          nombre:1,apellido:1,email:1,
        })
        const query = {_id_test: testId, _id_usuario: String(req.user._id), _id_empresa: infoTest._id_empresa}
        userTest = await usersTestsService.getUserTest(query)
        usuario = processUsuario(usuario,userTest)

        let totalPreguntas = 0;
        totalPreguntas = await preguntasService.count({_id_test: testId,tipo:'kpis',_id_cargo:ID_CARGO,delete: false});
        totalPreguntas = totalPreguntas + await preguntasService.count({_id_test: testId,tipo:'desempeno',_id_cargo:ID_CARGO,delete: false});

        let usuarioEvaluar = await usersService.getUserById(userId,{nombre:1,apellido:1,email:1})
        const data = {
          test: infoTest,
          origen: 'cuantitativas',
          preguntas: preguntas || [],
          respondidas: obj_ids.length,
          total: totalPreguntas,
          empresa: empresaInfo,
          usuario: usuario['usuario'],
          usuarioTest: usuario['usuarioTest'],
          usuarioAEvaluar: usuarioEvaluar,
          _id_usuario_test: userTest._id,
        }
        if (data.respondidas < data.total)
          res.status(200).json({
              data: data,
              message: "Preguntas pendiente"
          });
        else{
          await procesarPreguntasCualitativas(res,infoTest,userId,req,usersTestsService,testId,obj_ids,preguntasService,empresasService,usersService,totalPreguntas)
        }

        /************************ */

      }else{
        await procesarPreguntasCualitativas(res,infoTest,userId,req,usersTestsService,testId,obj_ids,preguntasService,empresasService,usersService,0)
      }


      

    } catch (err) {
      next(err);
    }
  });







  router.get("/preguntas-pendientes/cuantitativas/test/:testId/usuario/:usuarioId", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:users','read:tests','read:preguntas','read:respuestas']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      let limit = 6
      const { testId, usuarioId } = req.params;
      const infoTest = await testsService.getTest(testId)
      let preguntas = {
        kpis: [],
        desempeno: []
      }

      let preguntasKpisArray = await preguntasCuantitativasService.getIdsPreguntas({_id_test: String(testId),tipo:'kpis',delete:false})
      let preguntasDesempenoArray = await preguntasCuantitativasService.getIdsPreguntas({_id_test: String(testId),tipo:'desempeno',delete:false})

      for (let index = 0; index < preguntasKpisArray.length; index++) {
        let element = preguntasKpisArray[index];
        let respuestaCualitativa = await respuestasService.getOne({_id_user_calificado:String(usuarioId),_id_test: String(testId),_id_pregunta:String(element._id)}) 
        if (Object.keys(respuestaCualitativa).length === 0){
          respuestaCualitativa = {
            _id: null,
            _id_pregunta: String(element._id),
            _id_user_calificado: String(usuarioId),
            _id_users_calificaron: [],
            _id_test: String(testId),
            value: null,
            delete: false
          }
        }
        element["respuesta"] = respuestaCualitativa
        preguntas["kpis"].push(element)
      }

      for (let index = 0; index < preguntasDesempenoArray.length; index++) {
        let element = preguntasDesempenoArray[index];
        let respuestaCualitativa = await respuestasService.getOne({_id_user_calificado:String(usuarioId),_id_test: String(testId),_id_pregunta:String(element._id)}) 
        if (Object.keys(respuestaCualitativa).length === 0){
          respuestaCualitativa = {
            _id: null,
            _id_pregunta: String(element._id),
            _id_user_calificado: String(usuarioId),
            _id_users_calificaron: [],
            _id_test: String(testId),
            value: null,
            delete: false
          }
        }
        element["respuesta"] = respuestaCualitativa
        preguntas["desempeno"].push(element)
      }
      const empresaInfo = await empresasService.getEmpresa({empresaId: infoTest._id_empresa})
      let usuario = await usersService.getUserById(req.user._id,{
        nombre:1,apellido:1,email:1,
      })
      let usuarioEvaluar = await usersService.getUserById(usuarioId,{nombre:1,apellido:1,email:1})
      const data = {
        test: infoTest,
        preguntas: preguntas || [],
        empresa: empresaInfo,
        usuario: usuario,
        usuarioAEvaluar: usuarioEvaluar
      }
      res.status(200).json({
          data: data,
          message: "Preguntas pendiente"
      });

    } catch (err) {
      next(err);
    }
  });



  router.post("/procesar/test/:testId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:tests','create:users','update:users']),
    validateArrayUsers(createUserSchema),
    async function(req,res,next) {
        try {
            const { body: {usuarios} } = req;
            const { testId } = req.params;
            
            const createdUsers = await usersService.createUsers({ usuarios, testId });
            if (createdUsers){
                res.status(201).json({
                    data: usuarios,
                    message: "Usuarios creados."
                });
            }else{
                res.status(400).json({
                    data: null,
                    message: "No se pudo procesar usuarios."
                });
            }
            
        } catch (err) {
            next(err);
        }
  });

  router.delete(
    "/usuariotest/:_id/test/:_id_test",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['delete:users_tests']),
    async function(req, res, next) {
      const { _id, _id_test } = req.params;

      try {

        const userTest = await usersTestsService.getById(_id,{_id_usuario:1})
        const _id_user = userTest._id_usuario
        const deletedUserTest = await usersTestsService.deleteFisicamenteOne({_id:ObjectId(_id)})
        const respuestas = await respuestasService.deleteFisicamenteMany({_id_user,_id_test})
        const respuestasCualitativas = await respuestasCualitativasService.deleteFisicamenteMany({_id_user,_id_test})

        res.status(200).json({
          data: _id,
          message: "Usuario y respuestas de test eliminado."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.put("/completar/usuariotest/:usuarioTestId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:users','update:users_tests']),
    validationSub(updateUserSchema,'body','usuario'),
    validationSub(updateUserTestsSchema,'body','usuarioTest'),
    async function(req,res,next) {
        try {
            const { body: {usuario,usuarioTest} } = req;
            const { usuarioTestId } = req.params;
            const updatedUsuario = await usersService.updateUser({
              userId:usuarioTest._id_usuario,user:usuario})
            const updatedUsuarioTest = await usersTestsService.updateUserTest({
              userTestId:usuarioTestId,userTest:usuarioTest})

            if (updatedUsuario && updatedUsuarioTest){
                res.status(200).json({
                    data: updatedUsuario,
                    message: "Usuario actualizado correctamente."
                });
            }else{
                res.status(400).json({
                    data: null,
                    message: "No se pudo actualizar usuario."
                });
            }
            
        } catch (err) {
            next(err);
        }
  });


  router.put("/usuariotest/:usuarioTestId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:users','update:users_tests']),
    validation(updateUserAsignacionesSchema,'body'),
    async function(req,res,next) {
        try {
            const { body: usuarioTest } = req;
            const { usuarioTestId } = req.params;
            const updatedUsuarioTest = await usersTestsService.updateUserTest({
              userTestId:usuarioTestId,userTest:usuarioTest})

            if (updatedUsuarioTest){
                res.status(200).json({
                    data: updatedUsuarioTest,
                    message: "Usuarios asignados correctamente."
                });
            }else{
                res.status(400).json({
                    data: null,
                    message: "No se pudo asignar usuarios."
                });
            }
            
        } catch (err) {
            next(err);
        }
  });


  router.put("/:usuarioId",
    passport.authenticate("jwt", { session: false }),
    scopesValidationHandler(['update:users']),
    validation(updateUserSimpleSchema),
    async function(req,res,next) {
        try {
            const { body: usuario } = req;
            const { usuarioId } = req.params;
            const updated = await usersService.updateUserSimple({
              usuarioId,
              usuario
            });
            res.status(200).json({
              data: usuarioId,
              message: "Usuario actualizado."
            });
            
        } catch (err) {
            next(err);
        }
  });

  router.get("/select/all", 
    passport.authenticate("jwt", { session: false }), 
    scopesValidationHandler(['read:users']),
    async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    try {
      //String(req.query._id_test)
      const query = Object.assign(req.query,{delete: false})
      if (query._id_usuario)
        query._id_usuario = JSON.parse(query._id_usuario)
      const resultUsersTest = await usersTestsService.getAll(query)
      let usuarios = []
      for (let index = 0; index < resultUsersTest.length; index++) {
        const element = resultUsersTest[index];
        const resultUsers = await usersService.getUserById(String(element._id_usuario),{nombre:1,apellido:1,email:1})
        usuarios.push(resultUsers)
      }
      usuarios.map(doc => {
        doc.value = String(doc._id)
        doc.text = `${doc.nombre} ${doc.apellido} - ${doc.email}`
        delete doc._id
        delete doc.nombre
        delete doc.apellido
        delete doc.email
        delete doc.password
        delete doc.otp
        delete doc.rol
        delete doc.created_at
        delete doc.delete
        delete doc.updated_at
      })

      res.status(200).json({
        data: usuarios,
        message: "Usuarios todos listados"
      });
    } catch (err) {
      next(err);
    }
  });

  
}

module.exports = usersApi;
