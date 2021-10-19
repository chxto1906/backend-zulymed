const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createPreguntasPostCovidSchema = {
    tipo: Joi.string().valid("simple").default('simple'),
    descripcion: Joi.string().max(500).required(),
    orden: Joi.number().required(),
    dimension: Joi.string().max(100).required(),
    subdimension: Joi.string().max(100).required(),
    si: Joi.number().min(0).max(99).required(),
    no: Joi.number().min(0).max(99).required(),
    otro: Joi.number().min(0).max(99),
    _id_test: idSchema.required(),
    delete: Joi.boolean().default(false),
    created_at: Joi.date().default(Date.now())
};

const updatePreguntasPostCovidSchema = {
    tipo: Joi.string().valid("simple"),
    descripcion: Joi.string().max(500),
    orden: Joi.number(),
    dimension: Joi.string().max(100),
    subdimension: Joi.string().max(100),
    si: Joi.number().min(0).max(99),
    no: Joi.number().min(0).max(99),
    otro: Joi.number().min(0).max(99),
    _id_test: idSchema,
    delete: Joi.boolean(),
    updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createPreguntasPostCovidSchema,
  updatePreguntasPostCovidSchema
};
