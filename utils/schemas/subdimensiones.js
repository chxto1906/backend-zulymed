const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createSubdimensionesSchema = {
  abreviatura: Joi.string().max(5).required(),
  label: Joi.string().max(30).required(),
  delete: Joi.boolean().default(false),
  created_at: Joi.date().default(Date.now())
};

const updateSubdimensionesSchema = {
  abreviatura: Joi.string().max(5),
  label: Joi.string().max(30),
  delete: Joi.boolean(),
  updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createSubdimensionesSchema,
  updateSubdimensionesSchema
};
