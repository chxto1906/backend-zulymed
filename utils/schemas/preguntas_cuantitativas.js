const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createPreguntasCuantitativasSchema = {
    tipo: Joi.string().valid("kpis","desempeno").required(),
    indicador: Joi.string().max(200).required(),
    forma_calculo: Joi.string().max(400).required(),
    _id_test: idSchema.required(),
    _id_cargo: idSchema.required(),
    peso: Joi.number().required(),
    meta: Joi.number().required(),
    delete: Joi.boolean().default(false),
    created_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createPreguntasCuantitativasSchema
};
