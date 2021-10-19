const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createCargosSchema = {
  nombre: Joi.string().max(50).required(),
  _id_empresa: idSchema.required(),
  delete: Joi.boolean().default(false),
  created_at: Joi.date().default(Date.now())
};

const updateCargosSchema = {
  nombre: Joi.string().max(50),
  _id_empresa: idSchema,
  delete: Joi.boolean(),
  updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createCargosSchema,
  updateCargosSchema
};
