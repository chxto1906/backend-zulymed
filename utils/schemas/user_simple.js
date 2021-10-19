const joi = require('joi');

const idSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

const updateUserSimpleSchema = {
    nombre:             joi.string().max(100),
    apellido:           joi.string().max(100),
    email:              joi.string().email(),
    updated_at:         joi.date().default(Date.now())
}

module.exports = {
    idSchema,
    updateUserSimpleSchema
}