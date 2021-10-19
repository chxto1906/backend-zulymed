
const MongoLib = require("../lib/mongo");
const { validationLocal } = require("../utils/middlewares/validationHandler");

class PreguntasCualitativasGeneralesService {
  constructor() {
    this.collection = "preguntas";
    this.mongoDB = new MongoLib();
  }

  async getPreguntas(query) {
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query,{created_at:1, orden:1});
    return result;
  }

  async getIdsPreguntas(query,fields,sort) {
    const result = await this.mongoDB.getAll(this.collection,query,fields,sort)
    return result
  }

  async getPregunta({ preguntaId }) {
    const pregunta = await this.mongoDB.get(this.collection, preguntaId);
    return pregunta || {};
  }

  async count(query) {
    const cantidad = await this.mongoDB.count(this.collection, query);
    return cantidad || 0;
  }

  async findPreguntas(query,sort,project,limit=6) {
    const preguntas = await this.mongoDB.find(this.collection,query,sort,limit,project);
    return preguntas || [];
  }

  async createPregunta({ pregunta }) {
    const createPreguntaId = await this.mongoDB.create(this.collection, pregunta);
    return createPreguntaId;
  }

  async createPreguntas({ preguntas }) {
    for (var i = 0, l = preguntas.length; i < l; i++) {
        const createPreguntaId = await this.mongoDB.create(this.collection, preguntas[i]);
        if (!createPreguntaId) {
          return false
        }
    }
    return true
  }

  async createPreguntasDiagnostico({ preguntas }) {
    for (var i = 0, l = preguntas.length; i < l; i++) {    
      const createPreguntaId = await this.mongoDB.create(this.collection, preguntas[i]);
      if (!createPreguntaId) {
        return false
      }
    }
    return true
  }

  async updatePregunta({ preguntaId, pregunta }) {
    const updatePreguntaId = await this.mongoDB.update(
      this.collection,
      preguntaId,
      pregunta
    );
    return updatePreguntaId;
  }

  async deletePregunta({ preguntaId }) {
    const deletedPreguntaId = await this.mongoDB.delete(
      this.collection,
      preguntaId
    );
    return deletedPreguntaId
  }

  async deletePreguntas(query) {
    const deleteFisico = await this.mongoDB.deleteFisicamente(this.collection,query)
    return deleteFisico
  }

}

module.exports = PreguntasCualitativasGeneralesService;
