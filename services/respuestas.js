const MongoLib = require("../lib/mongo");

class RespuestasService {
  constructor() {
    this.collection = "respuestas";
    this.mongoDB = new MongoLib();
  }

  processRespuestasSegunTipo(items,preguntasService,usersService,testsService){
    return Promise.all(
      items.map(async (item) => {
        const pregunta = await preguntasService.getPregunta({preguntaId:item._id_pregunta})
        const test = await testsService.getTest(item._id_test)
        item.pregunta = pregunta
        item.test = test
        if (test.tipo == "clima_laboral"){
          item.categoria = pregunta.subdimension
          item.subcategoria = pregunta.cla ? 'CLA: Si' : 'CLA: No'
        }
        if (test.tipo == "postcovid"){
          item.categoria = pregunta.dimension
          item.subcategoria = pregunta.subdimension
        }
        if (test.tipo == "diagnostico_motivacional") {
          item.categoria = "Sección "+pregunta.seccion
          item.subcategoria = pregunta.tipo_seccion
        }
        if (test.tipo == "desempeno") {
          if (pregunta.tipo == "kpis" || pregunta.tipo == "desempeno"){
            item.pregunta.descripcion = pregunta.indicador
            item.categoria = pregunta.tipo + ` (peso: ${pregunta.peso})`
            item.subcategoria = pregunta.forma_calculo + ` (meta: ${pregunta.meta})`
          }
          if (pregunta.tipo == "cualitativas_generales" || pregunta.tipo == "cualitativas_especificas"){
            item.categoria = pregunta.competencia
            item.subcategoria = pregunta.descripcion_nivel
          }
        }
        return item;
      })
    );
  }

  async getRespuestas(query) {
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;
  }

  async getOne(query) {
    const respuesta = await this.mongoDB.findOne(this.collection, query);
    return respuesta || {};
  }

  async getRespuesta({ respuestaId }) {
    const respuesta = await this.mongoDB.get(this.collection, respuestaId);
    return respuesta || {};
  }

  async getIds(query,fields) {
    const result = await this.mongoDB.getAll(this.collection,query,fields);
    return result || [];
  }

  async createRespuesta({ respuesta }) {
    const createRespuestaId = await this.mongoDB.create(this.collection, respuesta);
    return createRespuestaId;
  }

  async createRespuestas({ respuestas }) {

    for (var i = 0, l = respuestas.length; i < l; i++) {
      const createRespuestaId = await this.mongoDB.createUpdateAll(this.collection, respuestas[i]);
      if (!createRespuestaId)
        return false
    }
    return true

  }

  async updateRespuesta({ respuestaId, respuesta }) {
    const updateRespuestaId = await this.mongoDB.update(
      this.collection,
      respuestaId,
      respuesta
    );
    return updateRespuestaId;
  }

  async deleteRespuesta({ respuestaId }) {
    const deletedRespuestaId = await this.mongoDB.delete(
      this.collection,
      respuestaId
    );
    return deletedRespuestaId;
  }

  async deleteFisicamenteMany(query) {
    const deletedId = await this.mongoDB.deleteFisicamente(
      this.collection,
      query
    );
    return deletedId;
  }
}

module.exports = RespuestasService;
