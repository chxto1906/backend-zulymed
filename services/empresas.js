
const MongoLib = require("../lib/mongo");

class EmpresasService {
  constructor() {
    this.collection = "empresas";
    this.mongoDB = new MongoLib();
  }

  async getEmpresas(query) {
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;
  }

  async getEmpresasAll(query,project={}) {
    const result = await this.mongoDB.getAll(this.collection, query, project);
    return result;
  }

  async getEmpresa({ empresaId }) {
    const empresa = await this.mongoDB.get(this.collection, empresaId);
    return empresa || {};
  }

  async createEmpresa({ empresa }) {
    const createEmpresaId = await this.mongoDB.create(this.collection, empresa);
    return createEmpresaId;
  }

  async updateEmpresa({ empresaId, empresa }) {
    const updateEmpresaId = await this.mongoDB.update(
      this.collection,
      empresaId,
      empresa
    );
    return updateEmpresaId;
  }

  async deleteEmpresa({ empresaId }) {
    const deletedEmpresaId = await this.mongoDB.delete(
      this.collection,
      empresaId
    );
    return deletedEmpresaId;
  }
}

module.exports = EmpresasService;
