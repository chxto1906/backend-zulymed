
const MongoLib = require("../lib/mongo");
const { ObjectId, ObjectID } = require("mongodb");
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';



class TestsService {
  constructor() {
    this.collection = "tests";
    this.mongoDB = new MongoLib();
  }

  async procesarPreguntasUsersDesempeno(item,preguntasService,usersTestsService) {
    const cantidadCualitativas = await preguntasService.count({_id_test: String(item._id),$or:[{tipo:"cualitativas_generales"},{tipo:"cualitativas_especificas"},{tipo:"cualitativas_conocimientos"}],delete: false})
    const cantidadCuantitativas = await preguntasService.count({_id_test: String(item._id),$or:[{tipo:"kpis"},{tipo:"desempeno"}],delete: false})
    let usersTests = await usersTestsService.getAll({_id_test: String(item._id),delete:false})
    let cantidadPreguntas = 0
    for (let index = 0; index < usersTests.length; index++) {
      const element = usersTests[index];
      let cantidad = 0
      if (element.hasOwnProperty('_ids_jefes')){
        cantidad = cantidadCualitativas * element["_ids_jefes"].length
        cantidadPreguntas += cantidad
      }
      if (element.hasOwnProperty('_ids_pares')){
        cantidad = cantidadCualitativas * element["_ids_pares"].length
        cantidadPreguntas += cantidad
      }
      if (element.hasOwnProperty('_ids_subordinados')){
        cantidad = cantidadCualitativas * element["_ids_subordinados"].length
        cantidadPreguntas += cantidad
      }
      if (element.hasOwnProperty('_ids_quien_le_califica')){
        cantidad = cantidadCuantitativas * element["_ids_quien_le_califica"].length
        cantidadPreguntas += cantidad
      }
    }
    const resultado =  cantidadPreguntas
    return resultado

  }

  processNuevoResultTests(items,preguntasService,respuestasService,usersTestsService,empresasService){
    return Promise.all(
      items.map(async (item) => {
        let cantidadPreguntas = await preguntasService.count({_id_test: String(item._id),delete: false})
        let cantidadUsersTest = await usersTestsService.count({_id_test: String(item._id),delete: false})
        const empresa = await empresasService.getEmpresa({empresaId:item._id_empresa})
        let cantidadPreguntasUsuarios = cantidadPreguntas * cantidadUsersTest;
        if (item.tipo == 'desempeno')
          cantidadPreguntasUsuarios = await this.procesarPreguntasUsersDesempeno(item,preguntasService,usersTestsService)
        const preguntasRespondidasArray = await respuestasService.getIds({_id_test: String(item._id),delete:false},{_id_pregunta:1})
        const cantidadRespondidas = preguntasRespondidasArray.length
        let porcentaje = 0
        if (cantidadPreguntasUsuarios !== 0)
          porcentaje = cantidadRespondidas * 100 / cantidadPreguntasUsuarios
        porcentaje = porcentaje > 100 ? 100 : porcentaje
        item.empresa = empresa.nombre
        item.porcentaje = porcentaje
        return item;
      })
    );
  }

  processNuevoResultTestsSelectAll(items,empresasService) {
    return Promise.all(
      items.map(async (item) => {
        const empresa = await empresasService.getEmpresa({empresaId: item._id_empresa})
        item.nombre = `${item.nombre} - [${empresa.nombre}]`
        return item;
      })
    );
  }

  processUpdateUsersTests(items){
    const that = this
    return Promise.all(
      items.map(async (item) => {
        const updated = await that.mongoDB.findOneAndUpdate('users_tests',{_id: ObjectID(item._id)},{enviado:true})
        return updated
      })
    )
  }

  processNuevoResult(items){
    const apiInstanceContact = new SibApiV3Sdk.ContactsApi();
    const that = this
    return Promise.all(
      items.map(async (item) => {
        const user = await that.mongoDB.get('users',item._id_usuario)
        const createContact = {
          email: user.email,
          attributes: {nombre: user.nombre, apellidos: user.apellido, otp: user.otp},
          updateEnabled: true
        } 
        let creado = await apiInstanceContact.createContact(createContact)
        //item.name = user.nombre + ' '+ user.apellido
        item.email = user.email
        delete item._id_usuario
        delete item._id
        return item
      })
    )
  }

  async getTests(query) {
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;
  }

  async getTestsAll(query,project={}) {
    let queryAll = Object.assign(query,{delete: false})
    const result = await this.mongoDB.getAll(this.collection, queryAll, project);
    return result;
  }

  async getTestsFromIds(query,ids) {
    let obj_ids = ids.map(function(id) { return ObjectId(id); });
    let queryAll = Object.assign(query,{_id: {$in: obj_ids}})
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, queryAll);
    return result;
  }

  async getTest( testId ) {
    const test = await this.mongoDB.get(this.collection, testId);
    return test || {};
  }

  async createTest({ test }) {
    const createTestId = await this.mongoDB.create(this.collection, test);
    return createTestId;
  }

  async updateTest({ testId, test }) {
    const updateTestId = await this.mongoDB.update(
      this.collection,
      testId,
      test
    );
    return updateTestId;
  }

  async deleteTest({ testId }) {
    const deletedTestId = await this.mongoDB.delete(
      this.collection,
      testId
    );
    return deletedTestId;
  }

  async enviarEmailUsuario({testId,usuarioId}) {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
    const that = this

    let test = await this.mongoDB.get('tests',testId)
    let empresa = await this.mongoDB.get('empresas',test._id_empresa)
    let usersTest = await this.mongoDB.find('users_tests',{
      _id_test: testId, _id_empresa: test._id_empresa, _id_usuario: usuarioId
    },{},0,{_id_usuario:1})

    const contactsTo = await this.processNuevoResult(usersTest)
    if (contactsTo.length > 0){
      let vinculo = test.tipo == 'desempeno' ? `https://externaevaluaciones.com/evaluaciones-lista` : `https://externaevaluaciones.com/evaluacion/${test._id}`
      let templateId = test.tipo == 'desempeno' ? 3 : 1
      sendSmtpEmail = {
          to: contactsTo,
          templateId,
          params: {
              evaluacionnombre: test.nombre,
              empresa: empresa.nombre,
              vinculo
          }
      };
      const enviado = await apiInstance.sendTransacEmail(sendSmtpEmail)
      if (enviado){

        const countUsersTestPendientes = await this.mongoDB.count('users_tests',{
          _id_test: testId, _id_empresa: test._id_empresa, enviado: false
        })
        let estado_label = "enviado_parcial"
        if (countUsersTestPendientes == 0)
          estado_label = "enviado_completo"
        const estado = await that.mongoDB.findOneAndUpdate(that.collection,{_id: ObjectID(test._id)},{estado:estado_label})
        return estado

      }else{
        return false
      }
    }else{
      return false
    }
  }

  async enviarEmailsUsuarios({testId}) {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
    const that = this
    //let users = await this.mongoDB.find('users',{tests: testId},{},0,{nombre:1,apellido:1,email:1,otp:1});

    let test = await this.mongoDB.get('tests',testId)
    let empresa = await this.mongoDB.get('empresas',test._id_empresa)
    let usersTest = await this.mongoDB.find('users_tests',{
      _id_test: testId, _id_empresa: test._id_empresa, enviado: false
    },{},90,{_id_usuario:1})
    let usersTestAux = await this.mongoDB.find('users_tests',{
      _id_test: testId, _id_empresa: test._id_empresa, enviado: false
    },{},90,{_id_usuario:1})
    console.dir(usersTestAux)
    if (usersTestAux.length == 0){
      await this.mongoDB.updateMany('users_tests',{
        _id_test: testId, _id_empresa: test._id_empresa
      },{enviado: false})
      usersTestAux = await this.mongoDB.find('users_tests',{
        _id_test: testId, _id_empresa: test._id_empresa, enviado: false
      },{},90,{_id_usuario:1})

      usersTest = await this.mongoDB.find('users_tests',{
        _id_test: testId, _id_empresa: test._id_empresa, enviado: false
      },{},90,{_id_usuario:1})
      
    }
    const contactsTo = await this.processNuevoResult(usersTest)
    let vinculo = test.tipo == 'desempeno' ? `https://externaevaluaciones.com/evaluaciones-lista` : `https://externaevaluaciones.com/evaluacion/${test._id}`
    let templateId = test.tipo == 'desempeno' ? 3 : 1
    const params = { evaluacionnombre: test.nombre, empresa: empresa.nombre,
        vinculo }
    if (contactsTo.length > 0){
      sendSmtpEmail = {to: contactsTo, templateId, params: params};
      const enviado = await apiInstance.sendTransacEmail(sendSmtpEmail)

      if (enviado){
        const updatedUsersTests = await this.processUpdateUsersTests(usersTestAux)
        const countUsersTestPendientes = await this.mongoDB.count('users_tests',{
          _id_test: testId, _id_empresa: test._id_empresa, enviado: false
        })
        let estado_label = "enviado_parcial"
        if (countUsersTestPendientes == 0)
          estado_label = "enviado_completo"
        const estado = await that.mongoDB.findOneAndUpdate(that.collection,{_id: ObjectID(test._id)},{estado:estado_label})
        return estado
      }else{
        return false
      }
    }else{
      return false
    }
  }




}

module.exports = TestsService;
