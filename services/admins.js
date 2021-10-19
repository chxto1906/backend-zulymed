
const MongoLib = require("../lib/mongo");
const { ObjectId } = require("mongodb");
const bcrypt = require('bcrypt');

class AdminsService {
  constructor() {
    this.collection = "users";
    this.mongoDB = new MongoLib();
  }

  async getAdmins(query) {
    query = Object.assign(query,{rol: 'admin'})
    const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;
  }

  async getAdminsAll(query,project={},sort={}) {
    const result = await this.mongoDB.getAll(this.collection, query, project, sort);
    return result;
  }

  async getAdmin({ adminId }) {
    const admin = await this.mongoDB.get(this.collection, adminId);
    return admin || {};
  }

  async createAdmin({ admin }) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    admin.password = hashedPassword
    const createAdminId = await this.mongoDB.create(this.collection, admin);
    return createAdminId;
  }

  async updateAdmin({ adminId, admin }) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    admin.password = hashedPassword
    const updateAdminId = await this.mongoDB.update(
      this.collection,
      adminId,
      admin
    );
    return updateAdminId;
  }

  async deleteAdmin({ adminId }) {
    const deletedAdminId = await this.mongoDB.delete(
      this.collection,
      adminId
    );
    return deletedAdminId;
  }

  processNuevoResultAdmins(items, empresasService){
    return Promise.all(
      items.map(async (item) => {
        const empresa = await empresasService.getEmpresa({empresaId: item._id_empresa})
        item.empresa = empresa ? empresa.nombre : ''
        return item;
      })
    );
  }

}

module.exports = AdminsService;
