const joi = require('joi');

const systemIdSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createSystemSchema = {
    nombre:                     joi.string().max(50).required(),
    logo:                       joi.string().max(300).required(),
    colores:    {
        fondo_principal:        joi.string().max(30).required(),
        fondo_menu_principal:   joi.string().max(30).required(),
        fondo_menu_secundario:  joi.string().max(30).required(),
        texto_titulo_1:         joi.string().max(30).required(),
        texto_titulo_2:         joi.string().max(30).required(),
        texto_titulo_3:         joi.string().max(30).required(),
        texto_normal_1:         joi.string().max(30).required(),
        texto_normal_2:         joi.string().max(30).required(),
        texto_menu_1:           joi.string().max(30).required(),
        texto_menu_2:           joi.string().max(30).required(),
        boton_1:                joi.string().max(30).required(),
        boton_2:                joi.string().max(30).required(),
        texto_boton_1:          joi.string().max(30).required(),
        texto_boton_2:          joi.string().max(30).required(),
        logos_1:                joi.string().max(30).required(),
        logos_2:                joi.string().max(30).required()
    }
}

const updateSystemSchema = {
    nombre:                     joi.string().max(50),
    logo:                       joi.string().max(300),
    colores:    {
        fondo_principal:        joi.string().max(30),
        fondo_menu_principal:   joi.string().max(30),
        fondo_menu_secundario:  joi.string().max(30),
        texto_titulo_1:         joi.string().max(30),
        texto_titulo_2:         joi.string().max(30),
        texto_titulo_3:         joi.string().max(30),
        texto_normal_1:         joi.string().max(30),
        texto_normal_2:         joi.string().max(30),
        texto_menu_1:           joi.string().max(30),
        texto_menu_2:           joi.string().max(30),
        boton_1:                joi.string().max(30),
        boton_2:                joi.string().max(30),
        texto_boton_1:          joi.string().max(30),
        texto_boton_2:          joi.string().max(30),
        logos_1:                joi.string().max(30),
        logos_2:                joi.string().max(30)
    }
}

module.exports = {
    systemIdSchema,
    createSystemSchema,
    updateSystemSchema
}