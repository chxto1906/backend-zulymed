const { ObjectId } = require("mongodb");

class MongoLib {
  constructor() {
    this.db = app.locals.db;
    this.size = 10
  }

  promedioCompetenciasCualitativas(tipo,_id_test,_id_user=null,_id_users_calificaron=null,ids_users=[]) {
    let match = {_id_test:_id_test,delete:false}
    if (_id_user)
      match = {_id_test:_id_test,delete:false,_id_user}
    if (_id_users_calificaron)
      match = Object.assign(match,{_id_users_calificaron})
    if (ids_users.length > 0)
      match = Object.assign(match,{_id_user:{$in:ids_users}})
    return this.db.collection('respuestas')
      .aggregate([{$match:match},
        {$addFields:{valueInt:{$toInt:"$value"}}},
        {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"},"valueInt":1}},
        {$lookup:{from: 'preguntas',localField: "_id_pregunta",foreignField: "_id",as: "preguntas"}},
        {$match:{"preguntas.delete":false,"preguntas.tipo":tipo}},
        {$group:{_id:"$preguntas.competencia",promedio:{$avg:"$valueInt"}}},
        {$project:{promedioRound:{$round:["$promedio",2]}}},
        {$sort:{_id:1}}]).toArray()

  }

  obtenerCompetenciasCualitativas(tipo,_id_test){
    let match = {_id_test:_id_test,tipo,delete:false}
    return this.db.collection('preguntas')
      .aggregate([{$match:match},
        {$group:{_id:"$competencia",nivel_requerido:{$avg:"$nivel_requerido"}}},
        {$sort:{_id:1}}]).toArray()
  }

  promedioIndicadoresCuantitativas(tipo,_id_test,_id_pregunta,_id_user=null,_id_users_calificaron=null,ids_users=[]) {
    let match = {_id_test:_id_test,delete:false}
    if (_id_user)
      match = {_id_test:_id_test,delete:false,_id_user}
    if (_id_users_calificaron)
      match = Object.assign(match,{_id_users_calificaron})
    if (_id_pregunta)
      match = Object.assign(match,{_id_pregunta})
    if (ids_users.length > 0)
      match = Object.assign(match,{_id_user:{$in:ids_users}})
    
    return this.db.collection('respuestas')
      .aggregate([{$match:match},
        {$addFields:{valueInt:{$toInt:"$value"}}},
        {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"},"valueInt":1}},
        {$lookup:{from: 'preguntas',localField: "_id_pregunta",foreignField: "_id",as: "preguntas"}},
        {$match:{"preguntas.delete":false,"preguntas.tipo":tipo}},
        {$group:{_id:"$preguntas.indicador",promedio:{$avg:"$valueInt"}}},
        {$project:{promedioRound:{$round:["$promedio",2]}}},
        {$sort:{_id:1}}]).toArray()

  }

  obtenerIndicadoresCuantitativas(tipo,_id_test){
    let match = {_id_test:_id_test,tipo,delete:false}
    return this.db.collection('preguntas')
      .aggregate([{$match:match},
        {$group:{_id:"$indicador",meta:{$avg:"$meta"}}},
        {$sort:{_id:1}}]).toArray()
  }

  puntajeRespondidasPorSeccion(collection,_id_test,seccion,tipo_seccion,_id_users) {
    let match = {_id_test:_id_test,delete:false}
    let matchSeccion = {"preguntas_info.seccion":seccion}
    if (tipo_seccion) 
      matchSeccion = {$and:[{"preguntas_info.seccion":seccion},{"preguntas_info.tipo_seccion":tipo_seccion}]}
    if (_id_users.length > 0)
      match = {_id_test:_id_test,delete:false,_id_user:{$in:_id_users}}
    return this.db.collection(collection)
      .aggregate([{$match:match},
      {$addFields:{valueInt:{$toInt:"$value"}}},
      {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"},"valueInt":1}},
      {$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},
      {$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },
      {$match:matchSeccion},
      {$group:{_id:null,sumaTotal:{$sum:"$valueInt"}}}]).toArray()
  }

  getRespuestasPorSeccion(collection,_id_test,seccion) {
    let match = {_id_test:_id_test,delete:false}
    let matchSeccion = {"preguntas_info.seccion":seccion}
    return this.db.collection(collection)
    .aggregate([{$match:match},
    {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"}}},
    {$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},
    {$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },
    {$match:matchSeccion}]).toArray()
  }

  cantidadRespuestasPorSeccion(collection,_id_test,seccion,tipo_seccion,_id_users) {
    let match = {_id_test:_id_test,delete:false}
    let matchSeccion = {"preguntas_info.seccion":seccion}
    if (tipo_seccion) 
      matchSeccion = {$and:[{"preguntas_info.seccion":seccion},{"preguntas_info.tipo_seccion":tipo_seccion}]}
    if (_id_users.length > 0)
      match = {_id_test:_id_test,delete:false,_id_user:{$in:_id_users}}
    return this.db.collection(collection)
    .aggregate([{$match:match},
    {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"}}},
    {$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},
    {$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },
    {$match:matchSeccion},
    {$group:{_id:null,cantidad:{$sum:1}}}]).toArray()

  }

  cantidadRespuestasIncentivos(collection,_id_test,opcion,tipo_seccion,_ids_users) {
    let seccion = "5"
    let sum = "$opciones."+opcion
    let match = {_id_test:_id_test,delete:false}
    if (_ids_users.length > 0)
      match = {_id_test:_id_test,delete:false,_id_user:{$in:_ids_users}}
    let matchSeccion = {$and:[{"preguntas_info.seccion":seccion},{"preguntas_info.tipo_seccion":tipo_seccion}]}
    return this.db.collection(collection)
    .aggregate([{$match:match},
    {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"},"opciones":1}},
    {$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},
    {$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },
    {$match:matchSeccion},
    {$group:{_id:null,cantidad:{$sum:sum}}}]).toArray()
    
  }

  puntajePreguntaMaxima(collection,_id_test,seccion) {
    let match = {_id_test:_id_test,delete:false,seccion}
    return this.db.collection(collection)
    .aggregate([{$match:match},
      {$addFields:{opcion4Int:{$toInt:"$opcion_4"}}},
      {$group:{_id:null,maxima:{$min:"$opcion4Int"}}}]).toArray()
  }

  cantidadRespuestasObtenidasClima(collection,_id_test,valor,cla=true,ids_users=[],dimension){

    let match = {_id_test:_id_test,delete:false,value:valor}

    let matchDimension = {"preguntas_info.subdimension":dimension}
    let matchCla = {"preguntas_info.cla":true}
    let matchClaNo = {"preguntas_info.cla":false}
    let matchClaDimension = matchCla
    if (dimension && cla)
      matchClaDimension = {$and:[matchCla,matchDimension]}
    if (dimension && !cla)
      matchClaDimension = {$and:[{$or:[matchCla,matchClaNo]},matchDimension]}
    if (!dimension && !cla) 
      matchClaDimension = {$and:[{$or:[matchCla,matchClaNo]}]}

    if (ids_users.length > 0){
      match = {_id_test:_id_test,delete:false,value:valor,_id_user:{$in:ids_users}}
    }
    return this.db.collection(collection)
    .aggregate([{$match:match},
    {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"},value:1}},
    {$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},
    {$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },
    {$match:matchClaDimension},
    {$group:{_id:null,sumaTotal:{$sum:"$preguntas_info."+valor}}}]).toArray()
  }

  cantidadRespuestasClima(collection,_id_test,cla=true,ids_users=[],dimension=null) {
    let match = {_id_test:_id_test,delete:false}
    
    let matchDimension = {"preguntas_info.subdimension":dimension}
    let matchCla = {"preguntas_info.cla":true}
    let matchClaNo = {"preguntas_info.cla":false}
    let matchClaDimension = matchCla
    if (dimension && cla)
      matchClaDimension = {$and:[matchCla,matchDimension]}
    if (dimension && !cla)
      matchClaDimension = {$and:[{$or:[matchCla,matchClaNo]},matchDimension]}
    if (!dimension && !cla) 
      matchClaDimension = {$and:[{$or:[matchCla,matchClaNo]}]}

    if (ids_users.length > 0){
      match = {_id_test:_id_test,delete:false,_id_user:{$in:ids_users}}
    }
    return this.db.collection(collection)
    .aggregate([
      {$match:match},
      {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"}}},
      {$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},
      {$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },
      {$match:matchClaDimension},
      {$group:{_id:null,sumaTotal:{$sum:1}}}]).toArray()
    
  }

  cantidadRespuestasPostCovid(collection,_id_test,ids_users=[],dimension=null,subdimension=null) {
    let match = {_id_test:_id_test,delete:false}
    let matchDimension = {"preguntas_info.dimension":dimension}
    let matchSubdimension = {"preguntas_info.subdimension":subdimension}
    let matchDimensionSubdimension = matchDimension;
    if (dimension && subdimension)
      matchDimensionSubdimension = {$and:[matchSubdimension,matchDimension]}
    if (dimension && !subdimension)
      matchDimensionSubdimension = matchDimension
    if (!dimension && subdimension)
      matchDimensionSubdimension = matchSubdimension
    
    if (ids_users.length > 0){
      match = {_id_test:_id_test,delete:false,_id_user:{$in:ids_users}}
    }
    
    return this.db.collection(collection)
    .aggregate([{$match:match},{$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"}}},{$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},{$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },{$match:matchDimensionSubdimension},{$group:{_id:null,sumaTotal:{$sum:1}}}]).toArray()
    
  }

  cantidadRespuestasObtenidasPostCovid(collection,_id_test,valor,ids_users=[],dimension=null,subdimension=null){

    let match = {_id_test:_id_test,delete:false,value:valor}
    let matchDimension = {"preguntas_info.dimension":dimension}
    let matchSubdimension = {"preguntas_info.subdimension":subdimension}
    let matchDimensionSubdimension = matchDimension;
    if (dimension && subdimension)
      matchDimensionSubdimension = {$and:[matchSubdimension,matchDimension]}
    if (dimension && !subdimension)
      matchDimensionSubdimension = matchDimension
    if (!dimension && subdimension)
      matchDimensionSubdimension = matchSubdimension

    if (ids_users.length > 0){
      match = {_id_test:_id_test,delete:false,value:valor,_id_user:{$in:ids_users}}
    }
    return this.db.collection(collection)
    .aggregate([{$match:match},
    {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"},value:1}},
    {$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},
    {$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },
    {$match:matchDimensionSubdimension},
    {$group:{_id:null,sumaTotal:{$sum:"$preguntas_info."+valor}}}]).toArray()
  }

  maximoPreguntas(collection,_id_test,valor,ids_users=[]) {

    let match = {_id_test:_id_test,delete:false,value:valor}
    if (ids_users.length > 0){
      match = {_id_test:_id_test,delete:false,value:valor,_id_user:{$in:ids_users}}
    }
      return this.db.collection(collection)
      .aggregate([
        {$match:match},
        {$project:{"_id_pregunta":{$toObjectId:"$_id_pregunta"},value:1}},
        {$lookup:{from: "preguntas",localField: "_id_pregunta",foreignField: "_id",as: "preguntas_info"}},
        {$unwind: { 'path': '$preguntas_info', 'preserveNullAndEmptyArrays': true } },
        {$group:{_id:null,maxVal:{$max:"$preguntas_info."+valor}}}]).toArray()
  }

  getCantidadTotalUsuariosByTest(collection,_id_test) {
    return this.db.collection(collection)
      .aggregate([
        {$match:{$and: [{_id_test:_id_test},{delete:false}]}},
        {$count:"cantidad"}]).toArray()
  }

  getCantidadUsuariosByTestAndEdad(collection,_id_test,desde,hasta=null) {
    let rangoEdad = {$gte:desde,$lte:hasta}
    if (!hasta)
      rangoEdad = {$gte:desde}
    return this.db.collection(collection)
      .aggregate([
        {$match:{_id_test:_id_test}},
        {$project:{"_id_usuario":{$toObjectId:"$_id_usuario"}}},
        {$lookup:{from: "users",localField: "_id_usuario",foreignField: "_id",as: "usuario"}},
        {$unwind: { 'path': '$usuario', 'preserveNullAndEmptyArrays': true } },
        {$project:{edadCalculada:{$round:[{$divide:[{$divide:[{$subtract:["$$NOW","$usuario.fecha_nacimiento"]},3600000]},8760]},2]}}},
        {$match:{edadCalculada:rangoEdad}},{$count:"cantidad"}]).toArray()
  }

  getIdsUsuariosByTestAndEdad(collection,_id_test,desde,hasta=null) {
    let rangoEdad = {$gte:desde,$lte:hasta}
    if (!hasta)
      rangoEdad = {$gte:desde}
    return this.db.collection(collection)
      .aggregate([
        {$match:{_id_test:_id_test}},
        {$project:{"_id_usuario":{$toObjectId:"$_id_usuario"}}},
        {$lookup:{from: "users",localField: "_id_usuario",foreignField: "_id",as: "usuario"}},
        {$unwind: { 'path': '$usuario', 'preserveNullAndEmptyArrays': true } },
        {$project:{"usuario._id":1,edadCalculada:{$round:[{$divide:[{$divide:[{$subtract:["$$NOW","$usuario.fecha_nacimiento"]},3600000]},8760]},2]}}},
        {$match:{edadCalculada:rangoEdad}}]).toArray()
  }
  
  
  getCantidadUsuariosByTestAndAntiguedad(collection,_id_test,desde,hasta=null) {
    let antiguedad = {$gte:desde,$lte:hasta}
    if (!hasta)
      antiguedad = {$gte:desde}
    return this.db.collection(collection)
      .aggregate([
        {$match:{$and: [{_id_test:_id_test},{delete:false},{antiguedad:antiguedad}]}},
        {$count:"cantidad"}]).toArray()
  }

  getCantidadUsuariosGroupByAreasByTest(collection,_id_test) {
    return this.db.collection(collection)
      .aggregate([
        {$match:{_id_test:_id_test}},
        {$project:{"_id_departamento":{$toObjectId:"$_id_departamento"},"_id_test":1}},
        {$lookup:{from: "departamentos",localField: "_id_departamento",foreignField: "_id",as: "departamento_info"}},
        {$group:{_id:"$departamento_info.nombre",count:{$sum:1}}},
        {$match:{"_id":{$size:1}}}]).toArray()
  }

  getCantidadSexoByTest(collection,_id_test,sexo) {
    return this.db.collection(collection)
      .aggregate([
        {$match:{_id_test:_id_test,delete:false}},
        {$project:{"_id_usuario":{$toObjectId:"$_id_usuario"},"_id_test":1}},
        {$lookup:{from: "users",localField: "_id_usuario",foreignField: "_id",as: "user_info"}},
        {$match:{"user_info.sexo":sexo}},
        {$count:"cantidad"}]).toArray()
  }

  getAll(collection, query, project={}, sort={}) {
    return this.db
      .collection(collection)
      .find(query)
      .sort(sort)
      .project(project)
      .toArray();
  }

  async getAllLikeSizeLimitLike(collection, query) {
    let queryAll = {delete: false}
    let { nombre, size, page } = query;
    let data = []
    let total = 0
    let totalPages = 1;
    if (nombre)
      queryAll = {nombre: new RegExp(nombre, 'i'), delete: false }
    if (page) {
      total = await this.db
      .collection(collection)
      .countDocuments(queryAll);

      size = size ? size : this.size
      totalPages = Math.round(total / size);
      data = await this.db
      .collection(collection)
      .find(queryAll)
      .skip(page > 0 ? ( page * size ) : 0)
      .limit(parseInt(size))
      .sort({created_at:1})
      .toArray();
    } else {
      data = this.db
      .collection(collection)
      .find(queryAll)
      .toArray();
    }

    return {
      data: data,
      total: total,
      totalPages: totalPages
    }

  }

  async getAllLikeSizeLimit(collection, query,sort={_id:-1}) {
    let { nombre, descripcion, size, page, label } = query;
    let data = []
    let total = 0
    let totalPages = 1;
    delete query.size
    delete query.page
    delete query.nombre
    delete query.descripcion
    delete query.label
    query.delete = false
    if (nombre && nombre.length > 0)
      query.nombre = new RegExp(nombre, 'i')
    if (descripcion && descripcion.length > 0)
      query.descripcion = new RegExp(descripcion, 'i')
    if (label && label.length > 0)
      query.label = new RegExp(label, 'i')
    
    let queryAll = Object.assign({delete: false},query)
    if (page) {
      total = await this.db
      .collection(collection)
      .countDocuments(queryAll);
      size = size ? size : this.size
      totalPages = Math.round(total / size);
      const skip = page > 0 ? ( page * size ) : 0
      data = await this.db
      .collection(collection)
      .find(queryAll)
      .skip(skip)
      .limit(parseInt(size))
      .sort(sort)
      .toArray();
    } else {
      data = this.db
      .collection(collection)
      .find(queryAll)
      .toArray();
    }

    return {
      data: data,
      total: total,
      totalPages: totalPages
    }

  }

  findOne(collection, query) {
    let auxQuery = Object.assign(query,{delete: false})
    return this.db.collection(collection).findOne(auxQuery);
  }

  findOneAndUpdate(collection, query, dataSet) {
    let auxQuery = Object.assign(query,{delete: false})
    return this.db.collection(collection).findOneAndUpdate(auxQuery,{$set:dataSet});
  }

  updateMany(collection, query, dataSet) {
    let auxQuery = Object.assign(query,{delete: false})
    return this.db.collection(collection).updateMany(auxQuery,{$set:dataSet});
  }

  count(collection, query) {
    return this.db.collection(collection).countDocuments(query);
  }

  find(collection, query, sort={}, limit=1, project={}) {
    let auxQuery = Object.assign(query,{delete: false})
    return this.db.collection(collection).find(auxQuery).sort(sort).limit(limit).project(project).toArray();
  }

  push(collection, query, push) {
    let auxQuery = Object.assign(query,{delete: false})
    return this.db.collection(collection).updateOne(auxQuery,{$push:push});
  }

  get(collection, id, fields={}) {
    return this.db.collection(collection).findOne({ _id: ObjectId(id), delete:false},fields);
  }

  getNoObject(collection, id, fields={}) {
    return this.db.collection(collection).findOne({ _id:id},fields);
  }

  create(collection, data) {
    return this.db.collection(collection).insertOne(data);
    //return this.db.collection(collection).updateMany(data, {$set:data}, { upsert: true })
  }

  createUpdateAll(collection, data) {
    //return this.db.collection(collection).insertOne(data);
    return this.db.collection(collection).updateMany(data, {$set:data}, { upsert: true })
  }

  update(collection, id, data) {
    return this.db
      .collection(collection)
      .updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true });
  }

  updateSimple(collection, id, data) {
    return this.db
      .collection(collection)
      .updateOne({ _id: ObjectId(id) }, { $set: data });
  }

  delete(collection, id) {
    //return this.db.collection(collection).deleteOne({ _id: ObjectId(id) }); elimina físicamente
    return this.db
      .collection(collection)
      .updateOne({ _id: ObjectId(id) }, { $set: {delete: true} });
  }

  deleteFisicamente(collection, query) {
    //return this.db.collection(collection).remove(query); //elimina físicamente
    return this.db.collection(collection).deleteMany(query); //elimina físicamente
  }

  deleteFisicamenteOne(collection, query) {
    //return this.db.collection(collection).remove(query); //elimina físicamente
    return this.db.collection(collection).deleteOne(query); //elimina físicamente
  }
}

module.exports = MongoLib;
