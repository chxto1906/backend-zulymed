const joi = require('joi');

const idSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createUserTestsSchema = {
    _id_test:           idSchema,
    _id_usuario:        idSchema,
    _id_empresa:        idSchema,
    _id_departamento:   idSchema,
    _id_cargo:          idSchema,
    antiguedad:         joi.number(),
    created_at:         joi.date().default(Date.now()),
    enviado:            joi.boolean().default(false),
    delete:             joi.boolean().default(false)
}

const updateUserTestsSchema = {
    _id_test:           idSchema.required(),
    _id_usuario:        idSchema.required(),
    _id_empresa:        idSchema.required(),
    _id_departamento:   idSchema.required(),
    _id_cargo:          idSchema.required(),
    antiguedad:         joi.number().required(),
    updated_at:         joi.date().default(Date.now()),
    enviado:            joi.boolean(),
    delete:             joi.boolean()
}

module.exports = {
    idSchema,
    createUserTestsSchema,
    updateUserTestsSchema
}