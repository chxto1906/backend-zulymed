
const MongoLib = require("../lib/mongo");

class UsersTestsService {
  constructor() {
    this.collection = "users_tests";
    this.mongoDB = new MongoLib();
  }

  async getById(id,fields) {
    const user  = await this.mongoDB.get(this.collection, id, fields);
    return user;
}

  async getUserTest(query) {
    const userTest = await this.mongoDB.findOne(this.collection, query);
    return userTest || {};
  }

  async getUsersTests(query) {
    const usersTests = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return usersTests || [];
  }

  async createUserTest({ userTest }) {
    const createUserTestId = await this.mongoDB.create(this.collection, userTest);
    return createUserTestId;
  }

  async getAll(query,project={}) {
    const result = await this.mongoDB.getAll(this.collection, query, project);
    return result;
  }

  async updateUserTest({ userTestId, userTest }) {
    const updateUserTestId = await this.mongoDB.update(
      this.collection,
      userTestId,
      userTest
    );
    return updateUserTestId;
  }

  async count(query) {
    const cantidad = await this.mongoDB.count(this.collection, query);
    return cantidad || 0;
  }

  async delete({ usuarioTestId }) {
    const deletedId = await this.mongoDB.delete(
      this.collection,
      usuarioTestId
    );
    return deletedId;
  }

  async deleteFisicamenteOne(query) {
    const deletedId = await this.mongoDB.deleteFisicamenteOne(
      this.collection,
      query
    );
    return deletedId;
  }

}

module.exports = UsersTestsService;
