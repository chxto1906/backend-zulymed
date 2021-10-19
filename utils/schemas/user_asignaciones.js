const joi = require('joi');

const idSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

const updateUserAsignacionesSchema = {
    _ids_jefes:             joi.array().items(),
    _ids_pares:             joi.array().items(),
    _ids_subordinados:      joi.array().items(),
    _ids_quien_le_califica: joi.array().items(),
    updated_at:             joi.date().default(Date.now())
}

module.exports = {
    idSchema,
    updateUserAsignacionesSchema
}