
const MongoLib = require("../lib/mongo");
const { ObjectId } = require("mongodb");

class DepartamentosService {
  constructor() {
    this.collection = "departamentos";
    this.mongoDB = new MongoLib();
  }

  async getDepartamentos(query) {
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;
  }

  async getDepartamentosAll(query,project={}) {
    const result = await this.mongoDB.getAll(this.collection, query, project);
    return result;
  }

  async getDepartamento({ departamentoId }) {
    const departamento = await this.mongoDB.get(this.collection, departamentoId);
    return departamento || {};
  }

  async createDepartamento({ departamento }) {
    const createDepartamentoId = await this.mongoDB.create(this.collection, departamento);
    return createDepartamentoId;
  }

  async updateDepartamento({ departamentoId, departamento }) {
    const updateDepartamentoId = await this.mongoDB.update(
      this.collection,
      departamentoId,
      departamento
    );
    return updateDepartamentoId;
  }

  async deleteDepartamento({ departamentoId }) {
    const deletedDepartamentoId = await this.mongoDB.delete(
      this.collection,
      departamentoId
    );
    return deletedDepartamentoId;
  }


  processNuevoResultDepartamentos(items){
    return Promise.all(
      items.map(async (item) => {
        const empresa = await this.mongoDB.get('empresas',ObjectId(item._id_empresa))
        item.empresa = empresa ? empresa.nombre : ''
        return item;
      })
    );
  }


}

module.exports = DepartamentosService;
