const Joi = require("joi");

const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createPreguntasDiagnosticoSchema = {
    tipo: Joi.string().valid("simple_custom").default('simple_custom'),
    orden: Joi.number().required(),
    numero: Joi.string().max(5).required(),
    descripcion: Joi.string().max(500).required(),
    _id_test: idSchema.required(),
    opcion_1: Joi.string().max(5).required(),
    opcion_2: Joi.string().max(5).required(),
    opcion_3: Joi.string().max(5).required(),
    opcion_4: Joi.string().max(5).required(),
    label_1: Joi.string().max(200),
    label_2: Joi.string().max(200),
    label_3: Joi.string().max(200),
    label_4: Joi.string().max(200),
    maximo_seleccionar: Joi.number().min(1).max(5).default(1),
    seccion: Joi.string().max(1).valid("1","2","3","4","5").required(),
    tipo_seccion: Joi.string().max(100).required(),
    delete: Joi.boolean().default(false),
    created_at: Joi.date().default(Date.now())
};

module.exports = {
  idSchema,
  createPreguntasDiagnosticoSchema
};
