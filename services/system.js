const MongoLib = require("../lib/mongo")

class SystemService {
  constructor() {
    this.collection = "system"
    this.mongoDB = new MongoLib();
  }

  async getSystem() {
    const system = await this.mongoDB.getAll(this.collection, {});
    return system || [];
  }

  async createSystem({ system }) {
    const createSystemId = await this.mongoDB.create(this.collection, system);
    return createSystemId;
  }

  async updateSystem({ systemId, system }) {
    const updateSystemId = await this.mongoDB.update(
      this.collection,
      systemId,
      system
    );

    return updateSystemId;
  }


}

module.exports = SystemService;