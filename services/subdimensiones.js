
const MongoLib = require("../lib/mongo");

class SubdimensionesService {
  constructor() {
    this.collection = "subdimensiones";
    this.mongoDB = new MongoLib();
  }

  async getSubdimensiones(query) {
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;
  }

  async getSubdimensionesAll(query,project={}) {
    const result = await this.mongoDB.getAll(this.collection, query, project);
    return result;
  }

  async getSubdimension({ subdimensionId }) {
    const subdimension = await this.mongoDB.get(this.collection, subdimensionId);
    return subdimension || {};
  }

  async createSubdimension({ subdimension }) {
    const createSubdimensionId = await this.mongoDB.create(this.collection, subdimension);
    return createSubdimensionId;
  }

  async updateSubdimension({ subdimensionId, subdimension }) {
    const updateSubdimensionId = await this.mongoDB.update(
      this.collection,
      subdimensionId,
      subdimension
    );
    return updateSubdimensionId;
  }

  async deleteSubdimension({ subdimensionId }) {
    const deletedSubdimensionId = await this.mongoDB.delete(
      this.collection,
      subdimensionId
    );
    return deletedSubdimensionId;
  }
}

module.exports = SubdimensionesService;
