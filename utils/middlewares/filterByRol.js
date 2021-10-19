

function filterByRol() {
  return function(req, res, next) {
    if (req.user.rol == 'admin'){
      req.query._id_empresa = req.user._id_empresa
    }
    next();
  }
}

module.exports = filterByRol;