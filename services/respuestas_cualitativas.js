const MongoLib = require("../lib/mongo");

class RespuestasCualitativasService {
  constructor() {
    this.collection = "respuestas";
    this.mongoDB = new MongoLib();
  }

  async getRespuestas(query) {
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;
  }

  async getRespuesta({ respuestaId }) {
    const respuesta = await this.mongoDB.get(this.collection, respuestaId);
    return respuesta || {};
  }

  async getOne(query) {
    const respuesta = await this.mongoDB.findOne(this.collection, query);
    return respuesta || {};
  }

  async getIds(query,fields) {
    const result = await this.mongoDB.getAll(this.collection,query,fields);
    return result || [];
  }

  async count(query) {
    const cantidad = await this.mongoDB.count(this.collection, query);
    return cantidad;  
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

module.exports = RespuestasCualitativasService;
