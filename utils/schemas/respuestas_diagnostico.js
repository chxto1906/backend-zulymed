const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createRespuestasDiagnosticoSchema = {
    _id_pregunta: idSchema.required(),
    _id_user: idSchema.required(),
    _id_test: idSchema.required(),
    value: Joi.string().max(20).required(),
    delete: Joi.boolean().default(false),
    created_at: Joi.date().default(Date.now())
};

const updateRespuestasDiagnosticoSchema = {
    _id_pregunta: idSchema,
    _id_user: idSchema,
    _id_test: idSchema,
    value: Joi.string().max(20),
    delete: Joi.boolean(),
    updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createRespuestasDiagnosticoSchema,
  updateRespuestasDiagnosticoSchema
};
