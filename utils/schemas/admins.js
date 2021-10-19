const joi = require('joi');

const idSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);


const createAdminsSchema = {
    nombre:             joi.string().max(100).required(),
    apellido:           joi.string().max(100).required(),
    email:              joi.string().email().required(),
    password:           joi.string().required(),
    _id_empresa:        idSchema.required(),
    rol:                joi.string().valid('admin').default('admin'),
    created_at:         joi.date().default(Date.now()),
    delete:             joi.boolean().default(false)
}

const updateAdminsSchema = {
    nombre:             joi.string().max(100),
    apellido:           joi.string().max(100),
    email:              joi.string().email(),
    password:           joi.string(),
    _id_empresa:        idSchema,
    rol:                joi.string().valid('admin'),
    updated_at:         joi.date().default(Date.now()),
    delete:             joi.boolean()
}

module.exports = {
    idSchema,
    createAdminsSchema,
    updateAdminsSchema
}