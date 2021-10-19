const Joi = require("joi");

const empresasIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
//const empresasTagSchema = Joi.array().items(Joi.string().max(10));

const createEmpresasSchema = {
  nombre: Joi.string()
    .max(30)
    .required(),
  ruc: Joi.string()
    .max(13)
    .required(),
  correo: Joi.string()
    .max(50)
    .required(),
  direccion: Joi.string()
    .max(50)
    .required(),
  telefono: Joi.string()
    .max(30)
    .required(),
  provincia: Joi.string()
    .max(30)
    .required(),
  ciudad: Joi.string()
    .max(30)
    .required(),
  parroquia: Joi.optional(),
  latitud: Joi.optional(),
  longitud: Joi.optional(),
  filepath: Joi.string().required(),
  delete: Joi.boolean().default(false),
  created_at: Joi.date().default(Date.now())
};

const updateEmpresasSchema = {
  nombre: Joi.string()
    .max(30),
  ruc: Joi.string()
    .max(13),
  correo: Joi.string()
    .max(50),
  direccion: Joi.string()
    .max(50),
  telefono: Joi.string()
    .max(30),
  provincia: Joi.string()
    .max(30),
  ciudad: Joi.string()
    .max(30),
  parroquia: Joi.optional(),
  latitud: Joi.optional(),
  longitud: Joi.optional(),
  filepath: Joi.string(),
  delete: Joi.boolean(),
  updated_at: Joi.date().default(Date.now())
};

module.exports = {
  empresasIdSchema,
  createEmpresasSchema,
  updateEmpresasSchema
};
