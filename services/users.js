const MongoLib = require("../lib/mongo");
const bcrypt = require('bcrypt');
const { ObjectId } = require("mongodb");
const { createUserSchema } = require("../utils/schemas/users");
const { createUserTestsSchema } = require("../utils/schemas/users_tests");
const { validationLocal } = require("../utils/middlewares/validationHandler");

class UsersService {
    constructor() {
        this.collection = 'users';
        this.mongoDB = new MongoLib();
    }
    
    async getAll(query,project={}) {
        const result = await this.mongoDB.getAll(this.collection, query, project);
        return result;
    }

    async getUsuarios(query) {
        const result = await this.mongoDB.getAllLikeSizeLimit('users_tests', query);
        return result;
    }

    async getUser({ email }) {
        const [ user ] = await this.mongoDB.getAll(this.collection, { email });
        return user;
    }

    async getUserById(id,fields) {
        const user  = await this.mongoDB.get(this.collection, id, fields);
        return user;
    }

    async createUser({ user }) {
        const { cedula, nombre, apellido, email, telefono, password, _empresa_id, departamento, antiguedad, 
            edad, sexo, rol, estado } = user;
        const hashedPassword = await bcrypt.hash(password, 10);
        const createUserId = await this.mongoDB.create(this.collection, {
            cedula,
            nombre,
            apellido,
            email,
            telefono, 
            password: hashedPassword,
            _empresa_id,
            departamento,
            antiguedad,
            edad,
            sexo,
            rol,
            estado
        });
        return createUserId;
    }

    search(nameKey, myArray = [], field='value'){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].value == nameKey) {
                return myArray[i];
            }
        }
        return false
    }


    checkTipoEvaluacionDesempenoCualitativas(item,_id_user) {
        let existeJefe = false
        let existePares = false
        let existeSubordinados = false
        if (item._ids_jefes && item._ids_jefes.length > 0)
            existeJefe = this.search(_id_user,item._ids_jefes)
        if (item._ids_pares && item._ids_pares.length > 0)
            existePares = this.search(_id_user,item._ids_pares)
        if (item._ids_subordinados && item._ids_subordinados.length > 0)
            existeSubordinados = this.search(_id_user,item._ids_subordinados)
        const result = (existeJefe || existePares || existeSubordinados) ? true : false
        return result
    }

    checkTipoEvaluacionDesempenoCuantitativas(item,_id_user) {
        const existe = this.search(_id_user,item._ids_quien_le_califica)
        const result = existe ? true : false
        return result
    }

    processNuevoResult(items,preguntasService,empresasService,respuestasService,testsService,_id_user){
        const that = this
        let result = Promise.all(
          items.map(async (item) => {
            const empresa = await empresasService.getEmpresa({empresaId: String(item._id_empresa)})
            const test = await testsService.getTest(item._id_test)
            if (typeof test._id !== 'undefined'){
              let cantidad = await preguntasService.count({_id_test: String(item._id_test),delete: false})
              if (test.tipo == 'desempeno'){
                  const cualitativas = that.checkTipoEvaluacionDesempenoCualitativas(item,_id_user)
                  const cuantitativas = that.checkTipoEvaluacionDesempenoCuantitativas(item,_id_user)
                  cantidad = 0
                  //const cargo = await that.mongoDB.get('cargos',item._id_cargo)
                  //console.log("** id_usuario: "+item._id_usuario+" --- CARGO: "+cargo.nombre)

                  if (cuantitativas){
                      if (Number(test.kpis_peso) > 0){
                        cantidad = cantidad + await preguntasService.count({_id_test: String(item._id_test),
                          tipo:'kpis',_id_cargo:item._id_cargo,delete: false})
                      }
                      if (Number(test.desempeno_peso) > 0){
                        cantidad = cantidad + await preguntasService.count({_id_test: String(item._id_test),
                          tipo:'desempeno',_id_cargo:item._id_cargo,delete: false})
                      }
                  }
                  if (cualitativas){
                      if (Number(test.competencias_generales_peso) > 0){
                        cantidad = cantidad + await preguntasService.count({_id_test: String(item._id_test),
                          tipo:'cualitativas_generales',delete: false})
                      }
                      if (Number(test.competencias_especificas_peso) > 0){
                        cantidad = cantidad + await preguntasService.count({_id_test: String(item._id_test),
                          tipo:'cualitativas_especificas',_id_cargo:item._id_cargo,delete: false})
                      }
                      if (Number(test.competencias_conocimientos_peso) > 0){
                        cantidad = cantidad + await preguntasService.count({_id_test: String(item._id_test),
                          tipo:'cualitativas_conocimientos',_id_cargo:item._id_cargo,delete: false})
                      }
                  }
              }
              const user = await this.getUserById(item._id_usuario,{nombre:1,apellido:1})
              let preguntasRespondidasArray = await respuestasService.getIds({_id_test: String(item._id_test), _id_user: String(_id_user)},{_id_pregunta:1})
              if (test.tipo == 'desempeno') {
                  preguntasRespondidasArray = await respuestasService.getIds({_id_test: String(item._id_test), _id_user: String(item._id_usuario),_id_users_calificaron:String(_id_user)},{_id_pregunta:1})
              }
              const cantidadRespondidas = preguntasRespondidasArray.length
              const porcentaje = cantidadRespondidas * 100 / cantidad
              item.id_test = test._id
              item.tipo = test.tipo
              item.cantidad = cantidad
              item.empresa = empresa.nombre
              item.evaluado = user.nombre + ' ' + user.apellido
              item._id_user_evaluador = _id_user
              item.porcentaje = Math.floor(porcentaje)
              item.nombre = test.nombre
              return item;
            }
          })
        );
        
        return result.then(function(items){
          //console.dir(items)
          return Object.values(items).filter(it => typeof it !== 'undefined')  
          //console.dir(new_items)
        })

        
    }

    processNuevoResultCualitativas(items,preguntasCualitativasService,respuestasCualitativasService,empresasService,testsService,_id_user){
        return Promise.all(
          items.map(async (item) => {
            //const cantidad = await preguntasService.count({_id_test: String(item._id_test),delete: false})
            const empresa = await empresasService.getEmpresa({empresaId: String(item._id_empresa)})
            const test = await testsService.getTest(item._id_test)
            const user = await this.getUserById(item._id_usuario,{nombre:1,apellido:1})
            const cantidadRespondidasArray = await respuestasCualitativasService.count({_id_test: String(item._id_test),
                _id_user_calificado:String(item._id_usuario),value:{$ne: null},delete:false})
            const cantidadPreguntasCualitativasArray = await preguntasCualitativasService.count({_id_test: String(item._id_test),delete:false})
            
            let estado = 'incompleto'
            if (cantidadPreguntasCualitativasArray > 0 && cantidadRespondidasArray == cantidadPreguntasCualitativasArray)
                estado = 'completo'

            item.id_test = test._id
            item.empresa = empresa.nombre
            item.nombre = test.nombre
            item.evaluado = user.nombre + ' ' + user.apellido
            item.estado = estado
            return item;
          })
        );
    }

    processFecha(valor) {
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

    getAge(dateString) 
    {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
        {
            age--;
        }
        return age;
    }

    processNuevoResultUsers(items,preguntasService,respuestasService,usersTestsService,empresasService,testsService,test){
        return Promise.all(
          items.map(async (item, index) => {
            const cargo = await this.mongoDB.get('cargos',ObjectId(item._id_cargo))
            let cantidad = await preguntasService.count({_id_test: String(item._id_test),delete: false})
            let porcentaje = 0
            if (test.tipo == "desempeno"){

              let userTests = await usersTestsService.getAll({
                _id_test: String(item._id_test),
                $or:[
                  {"_ids_jefes.value":String(item._id_usuario)},
                  {"_ids_pares.value":String(item._id_usuario)},
                  {"_ids_subordinados.value":String(item._id_usuario)},
                  {"_ids_quien_le_califica.value":String(item._id_usuario)}
                ]
              })
              const res = await this.processNuevoResult(userTests,preguntasService,
                empresasService,respuestasService,testsService,item._id_usuario)
              
              const sumall = res.map(item => item.porcentaje).reduce((prev, curr) => prev + curr, 0);
              if (userTests.length == 0)
                porcentaje = 0
              else{
                porcentaje = Math.floor(sumall / userTests.length)
              }
              
            } else {
              const preguntasRespondidasArray = await respuestasService
                  .getIds({_id_test: String(item._id_test), _id_user: String(item._id_usuario)},{_id_pregunta:1})
              const cantidadRespondidas = preguntasRespondidasArray.length
              porcentaje = cantidadRespondidas * 100 / cantidad
            }

            const usuario = await this.mongoDB.get('users',ObjectId(item._id_usuario))
            const departamento = await this.mongoDB.get('departamentos',ObjectId(item._id_departamento))
            

            
            
            item.cedula = usuario.cedula || ''
            item.nombre = usuario.nombre || ''
            item.apellido = usuario.apellido || ''
            item.email = usuario.email || ''
            item.telefono = usuario.telefono || ''
            item.departamento = departamento ? departamento.nombre : ''
            item.cargo = cargo ? cargo.nombre : ''
            item.fecha_nacimiento = usuario.fecha_nacimiento ? this.processFecha(usuario.fecha_nacimiento) : ''
            item.edad = usuario.fecha_nacimiento ? this.getAge(usuario.fecha_nacimiento) : ''
            item.sexo = usuario.sexo || ''
            item.porcentaje = Math.floor(porcentaje)

            return item;
          })
        );
    }

    async updateUserSimple({ usuarioId, usuario }) {
        const updateUserId = await this.mongoDB.updateSimple(
          this.collection,
          usuarioId,
          usuario
        );
        return updateUserId;
    }


    async createUsers({ usuarios, testId }){
        const that = this
        for (var i = 0, l = usuarios.length; i < l; i++) {
            let email = usuarios[i].email;
            let _id_usuario = null
            let usuario = await that.mongoDB.findOne(that.collection,{ email })
            if (!usuario){
                let usuarioCreado = await that.mongoDB.create(that.collection,usuarios[i])
                _id_usuario = usuarioCreado.insertedId
                if (!_id_usuario)
                    return false
            }else{
                _id_usuario = usuario._id
            }

            const test = await that.mongoDB.get('tests',testId,{_id_empresa:1})
            let _id_empresa = test._id_empresa
            const dataUsersTests = {
                _id_test: String(testId),
                _id_usuario: String(_id_usuario),
                _id_empresa: String(_id_empresa)
            }
            const usersTests = await that.mongoDB.findOne('users_tests',dataUsersTests)
            if (!usersTests){
                const data = validationLocal(createUserTestsSchema,dataUsersTests)
                if (data) {
                    const createUsersTests = await that.mongoDB.create('users_tests',data)
                    if (!createUsersTests)
                        return false
                }else{
                    return false
                }
            }


            /*const pushTestId = await that.mongoDB.push(that.collection, {_id: ObjectId(_id_usuario), 
                tests: {$ne: testId}}, {tests: testId});
            if (!pushTestId)
              return false*/
        }
        return true
    }

    async updateUser({ userId, user }) {
        const updateUserId = await this.mongoDB.update(
          this.collection,
          userId,
          user
        );
        return updateUserId;
    }

    
}

module.exports = UsersService;