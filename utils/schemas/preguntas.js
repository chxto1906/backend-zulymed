const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createPreguntasSchema = {
    tipo: Joi.string().valid("simple").default('simple'),
    descripcion: Joi.string().max(500).required(),
    orden: Joi.number().required(),
    subdimension: Joi.string().max(5).required(),
    cla: Joi.boolean().default(false),
    si: Joi.number().min(0).max(99).required(),
    no: Joi.number().min(0).max(99).required(),
    otro: Joi.number().min(0).max(99).required(),
    _id_test: idSchema.required(),
    delete: Joi.boolean().default(false),
    created_at: Joi.date().default(Date.now())
};

const updatePreguntasSchema = {
    tipo: Joi.string().valid("simple"),
    descripcion: Joi.string().max(500),
    orden: Joi.number(),
    subdimension: Joi.string().max(5),
    cla: Joi.boolean(),
    si: Joi.number().min(0).max(99),
    no: Joi.number().min(0).max(99),
    otro: Joi.number().min(0).max(99),
    _id_test: idSchema,
    delete: Joi.boolean(),
    updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createPreguntasSchema,
  updatePreguntasSchema
};
