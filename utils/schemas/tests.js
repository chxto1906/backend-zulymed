const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
//const empresasTagSchema = Joi.array().items(Joi.string().max(10));

const createTestsSchema = {
  nombre: Joi.string().max(30).required(),
  descripcion: Joi.string().max(1000).required(),
  tipo: Joi.string().valid("clima_laboral","diagnostico_motivacional","desempeno","postcovid").required(),
  estado: Joi.string().valid("pendiente","enviado_parcial","enviado_completo","completo").default("pendiente"),
  _id_empresa: idSchema.required(),
  periodo: Joi.string().max(50).allow(null,''),
  cargos: Joi.array().default([]),
  kpis_peso: Joi.number().default(0),
  desempeno_peso: Joi.number().default(0),
  competencias_generales_peso: Joi.number().default(0),
  competencias_especificas_peso: Joi.number().default(0),
  competencias_conocimientos_peso: Joi.number().default(0),
  delete: Joi.boolean().default(false),
  created_at: Joi.date().default(Date.now())
};

const updateTestsSchema = {
    nombre: Joi.string().max(30),
    descripcion: Joi.string().max(1000),
    tipo: Joi.string().valid("clima_laboral","diagnostico_motivacional","desempeno","postcovid"),
    estado: Joi.string().valid("pendiente","enviado_parcial","enviado_completo","completo"),
    _id_empresa: idSchema,
    periodo: Joi.string().max(50).allow(null,''),
    cargos: Joi.array(),
    kpis_peso: Joi.number().default(0),
    desempeno_peso: Joi.number().default(0),
    competencias_generales_peso: Joi.number().default(0),
    competencias_especificas_peso: Joi.number().default(0),
    competencias_conocimientos_peso: Joi.number().default(0),
    delete: Joi.boolean(),
    updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createTestsSchema,
  updateTestsSchema
};
