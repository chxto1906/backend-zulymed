const Joi = require("joi");
const boom = require("boom");
const bcrypt = require('bcrypt');

function validate(data, schema) {
  //const { error, value } = Joi.validate(data, schema);
  //return error;
  return Joi.validate(data, schema);
}

function validateArrayCuantitativas(schema, bodyParam='preguntas'){
  return function(req, res, next) {
    const { tipo } = req.params;
    const data = req.body[bodyParam]
    let peso = 0
    for (var i = 0, l = data.length; i < l; i++) {
      data[i].tipo = tipo
      if (data[i].numero)
        data[i].numero = Number(data[i].numero)
      if (data[i].opcion_1)
        data[i].opcion_1 = Number(data[i].opcion_1)
      if (data[i].opcion_2)
        data[i].opcion_2 = Number(data[i].opcion_2)
      if (data[i].opcion_3)
        data[i].opcion_3 = Number(data[i].opcion_3)
      if (data[i].opcion_4)
        data[i].opcion_4 = Number(data[i].opcion_4)
        console.log("Meta: "+data[i].meta)
      if (data[i].meta){
        let valor = Number(data[i].meta)
        if (isNaN(valor)){
          valor = Number(data[i].meta.replace(/,/g, '.'))
        }
        data[i].meta = valor
      }
      if (data[i].peso){
        let valor = Number(data[i].peso)
        if (isNaN(valor)){
          valor = Number(data[i].peso.replace(/,/g, '.'))
        }
        data[i].peso = valor
        peso += valor

        /*data[i].peso = Number(data[i].peso)
        peso += data[i].peso*/
      }

      let aux = Object.assign(data[i],req.params)
      console.dir(aux)
      const { error, value } = validate(aux, schema);
      if (error) {
        next(boom.badRequest(error))
        return false
      }

      data[i] = value
    }
    if (peso == 100)
      next()
    else{
      next(boom.badRequest())
      return false
    }
    
  }
}

function validateArrayCualitativas(schema, bodyParam='preguntas'){
  return function(req, res, next) {
    //const { tipo } = req.params;
    const data = req.body[bodyParam]
    let peso = 0
    for (var i = 0, l = data.length; i < l; i++) {
      //data[i].tipo = tipo
      if (data[i].numero)
        data[i].numero = data[i].numero.toString()
      if (data[i].opcion_1)
        data[i].opcion_1 = data[i].opcion_1.toString()
      if (data[i].opcion_2)
        data[i].opcion_2 = data[i].opcion_2.toString()
      if (data[i].opcion_3)
        data[i].opcion_3 = data[i].opcion_3.toString()
      if (data[i].opcion_4)
        data[i].opcion_4 = data[i].opcion_4.toString()
      if (data[i].orden)
        data[i].orden = Number(data[i].orden)
      if (data[i].maximo_seleccionar)
        data[i].maximo_seleccionar = Number(data[i].maximo_seleccionar)
      if (data[i].nivel_requerido)
        data[i].nivel_requerido = Number(data[i].nivel_requerido)

      let aux = Object.assign(data[i],req.params)
      const { error, value } = validate(aux, schema);
      if (error) {
        next(boom.badRequest(error))
        return false
      }

      data[i] = value
    }
    next()
  }
}

function validation(schema, check = "body") {
  return function(req, res, next) {
    if (req.file && check=="body")
      req[check].filepath=req.file.path   
    const { error, value } = validate(req[check], schema);

    if (error) {
      next(boom.badRequest(error))
    } else {
      req[check] = value
      next()
    }
    //error ? next(boom.badRequest(error)) : next();
  };
}

function validationSub(schema, check = "body", sub) {
  return function(req, res, next) {
    const { error, value } = validate(req[check][sub], schema);

    if (error) {
      next(boom.badRequest(error))
    } else {
      req[check][sub] = value
      next()
    }
    //error ? next(boom.badRequest(error)) : next();
  };
}

function validationLocal(schema, data) {
  
  const { error, value } = validate(data, schema);
  if (error) {
    return false
  }
  return value

}


function validateArray(schema,bodyParam='preguntas') {
  return function(req, res, next) {
    const data = req.body[bodyParam]
    for (var i = 0, l = data.length; i < l; i++) {
      if (data[i].numero)
        data[i].numero = data[i].numero.toString()
      if (data[i].opcion_1)
        data[i].opcion_1 = data[i].opcion_1.toString()
      if (data[i].opcion_2)
        data[i].opcion_2 = data[i].opcion_2.toString()
      if (data[i].opcion_3)
        data[i].opcion_3 = data[i].opcion_3.toString()
      if (data[i].opcion_4)
        data[i].opcion_4 = data[i].opcion_4.toString()
      
      if (data[i].label_1)
        data[i].label_1 = data[i].label_1.toString()
      if (data[i].label_2)
        data[i].label_2 = data[i].label_2.toString()
      if (data[i].label_3)
        data[i].label_3 = data[i].label_3.toString()
      if (data[i].label_4)
        data[i].label_4 = data[i].label_4.toString()

      let aux = Object.assign(data[i],req.params)
      const { error, value } = validate(aux, schema);
      if (error) {
        next(boom.badRequest(error))
        return false
      }
      data[i] = value
    }
    next()
    
  }
}

function validateArrayUsers(schema) {
  return async function(req, res, next) {
    const { body: {usuarios} } = req;
    for (var i = 0, l = usuarios.length; i < l; i++) {
      let otp = generateOTP()
      const hashedPassword = await bcrypt.hash(otp, 10);
      usuarios[i].email = usuarios[i].email.trim()
      let aux = Object.assign(usuarios[i],{password: hashedPassword, otp: otp})
      const { error, value } = validate(aux, schema);
      if (error) {
        next(boom.badRequest(error))
        return false
      }
      usuarios[i] = value
    }
    next()
  }
}

function generateOTP() { 
          
  // Declare a digits variable  
  // which stores all digits 
  var digits = '0123456789'; 
  let OTP = ''; 
  for (let i = 0; i < 6; i++ ) { 
      OTP += digits[Math.floor(Math.random() * 10)]; 
  } 
  return OTP; 
} 



module.exports = { validation, validateArray, validationLocal, 
  validateArrayUsers, validationSub, validateArrayCualitativas, validateArrayCuantitativas };
