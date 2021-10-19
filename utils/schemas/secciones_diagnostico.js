const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createSeccionesDiagnosticoSchema = {
    nombre: Joi.string().max(100).required(),
    indicaciones: Joi.string().max(500).required(),
    opcion_1: Joi.string().max(500).required(),
    valor_1: Joi.number().min(1).max(4).required(),
    opcion_2: Joi.string().max(500).required(),
    valor_2: Joi.number().min(1).max(4).required(),
    opcion_3: Joi.string().max(500).required(),
    valor_3: Joi.number().min(1).max(4).required(),
    opcion_4: Joi.string().max(500).required(),
    valor_4: Joi.number().min(1).max(4).required(),
    mostrar: Joi.boolean().default(true), 
    delete: Joi.boolean().default(false),
    created_at: Joi.date().default(Date.now())
};

const updateSeccionesDiagnosticoSchema = {
    nombre: Joi.string().max(100),
    indicaciones: Joi.string().max(500),
    opcion_1: Joi.string().max(500),
    valor_1: Joi.number().min(1).max(4),
    opcion_2: Joi.string().max(500),
    valor_2: Joi.number().min(1).max(4),
    opcion_3: Joi.string().max(500),
    valor_3: Joi.number().min(1).max(4),
    opcion_4: Joi.string().max(500),
    valor_4: Joi.number().min(1).max(4),
    mostrar: Joi.boolean(),
    delete: Joi.boolean().default(false),
    updated_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createSeccionesDiagnosticoSchema,
  updateSeccionesDiagnosticoSchema
};
