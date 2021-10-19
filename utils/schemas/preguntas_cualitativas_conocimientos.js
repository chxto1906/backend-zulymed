const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createPreguntasCualitativasConocimientosSchema = {
  tipo: Joi.string().valid("cualitativas_conocimientos").default('cualitativas_conocimientos'),
  orden: Joi.number().required(),
  numero: Joi.string().max(5).required(),
  descripcion: Joi.string().max(500).required(),
  _id_test: idSchema.required(),
  _id_cargo: idSchema.required(),
  competencia: Joi.string().max(200).required(),
  descripcion_nivel: Joi.string().max(500).required(),
  nivel_requerido: Joi.number().min(1).max(4).default(4),
  opcion_1: Joi.string().max(5).required(),
  opcion_2: Joi.string().max(5).required(),
  opcion_3: Joi.string().max(5).required(),
  opcion_4: Joi.string().max(5).required(),
  descripcion_nivel_1: Joi.string().max(500).required(),
  descripcion_nivel_2: Joi.string().max(500).required(),
  descripcion_nivel_3: Joi.string().max(500).required(),
  descripcion_nivel_4: Joi.string().max(500).required(),
  maximo_seleccionar: Joi.number().min(1).max(4).default(1),
  delete: Joi.boolean().default(false),
  created_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createPreguntasCualitativasConocimientosSchema
};
