const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createRespuestasSchema = {
    _id_pregunta: idSchema.required(),
    _id_user: idSchema.required(),
    _id_test: idSchema.required(),
    value: Joi.string().max(20).required(),
    opciones: Joi.object(),
    delete: Joi.boolean().default(false),
    created_at: Joi.date().default(Date.now())
};

const updateRespuestasSchema = {
    _id_pregunta: idSchema,
    _id_user: idSchema,
    _id_test: idSchema,
    value: Joi.string().max(20),
    opciones: Joi.object(),
    delete: Joi.boolean(),
    updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createRespuestasSchema,
  updateRespuestasSchema
};
