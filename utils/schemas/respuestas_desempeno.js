const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createRespuestasDesempenoSchema = {
    _id_pregunta: idSchema.required(),
    _id_user: idSchema.required(),
    _id_users_calificaron: Joi.array().required(),
    _id_test: idSchema.required(),
    value: Joi.number().required(),
    delete: Joi.boolean().default(false),
    created_at: Joi.date().default(Date.now())
};

const updateRespuestasDesempenoSchema = {
  _id_pregunta: idSchema,
  _id_user: idSchema,
  _id_users_calificaron: Joi.array(),
  _id_test: idSchema,
  value: Joi.number(),
  delete: Joi.boolean(),
  updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createRespuestasDesempenoSchema,
  updateRespuestasDesempenoSchema
};
