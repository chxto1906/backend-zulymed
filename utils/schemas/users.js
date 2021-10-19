const joi = require('joi');

const idSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);


const createUserSchema = {
    cedula:             joi.string().max(13),
    nombre:             joi.string().max(100).required(),
    apellido:           joi.string().max(100).required(),
    email:              joi.string().email().required(),
    telefono:           joi.string().max(20),
    password:           joi.string().required(),
    otp:                joi.string(),
    fecha_nacimiento:   joi.date().iso(),
    sexo:               joi.string().valid('M','F'),
    rol:                joi.string().valid('superadmin','admin','user').default('user'), //superadmin, admin, user
    //tests:            idSchema),
    created_at:         joi.date().default(Date.now()),
    delete:             joi.boolean().default(false)
}

const updateUserSchema = {
    cedula:             joi.string().max(13).required(),
    nombre:             joi.string().max(100),
    apellido:           joi.string().max(100),
    email:              joi.string().email(),
    telefono:           joi.string().max(20).required(),
    password:           joi.string(),
    otp:                joi.string(),
    fecha_nacimiento:   joi.date().iso().required(),
    sexo:               joi.string().valid('M','F').required(),
    rol:                joi.string().valid('superadmin','admin','user'), //superadmin, admin, user
    //tests:            joi.array().items(idSchema),
    updated_at:         joi.date().default(Date.now()),
    delete:             joi.boolean()
}

module.exports = {
    idSchema,
    createUserSchema,
    updateUserSchema
}