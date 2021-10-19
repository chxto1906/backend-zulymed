
const MongoLib = require("../lib/mongo");
const { ObjectId } = require("mongodb");

class CargosService {
  constructor() {
    this.collection = "cargos";
    this.mongoDB = new MongoLib();
  }

  async getCargos(query) {
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;
  }

  async getCargosAll(query,project={},sort={}) {
    const result = await this.mongoDB.getAll(this.collection, query, project, sort);
    return result;
  }

  async getCargo({ cargoId }) {
    const cargo = await this.mongoDB.get(this.collection, cargoId);
    return cargo || {};
  }

  async createCargo({ cargo }) {
    const createCargoId = await this.mongoDB.create(this.collection, cargo);
    return createCargoId;
  }

  async updateCargo({ cargoId, cargo }) {
    const updateCargoId = await this.mongoDB.update(
      this.collection,
      cargoId,
      cargo
    );
    return updateCargoId;
  }

  async deleteCargo({ cargoId }) {
    const deletedCargoId = await this.mongoDB.delete(
      this.collection,
      cargoId
    );
    return deletedCargoId;
  }

  processNuevoResultCargos(items){
    return Promise.all(
      items.map(async (item) => {
        const empresa = await this.mongoDB.get('empresas',ObjectId(item._id_empresa))
        item.empresa = empresa ? empresa.nombre : ''
        return item;
      })
    );
  }

}

module.exports = CargosService;
