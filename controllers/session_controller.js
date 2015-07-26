//MW de autorizacion de accesosHTTP restringdos
exports.loginRequired = function(req, res, next){
  if (req.session.user){
    next();

  }else{
    res.redirect('/login');
  }
};


// GET /login -- formulario de login
exports.new = function(req,res){
	var errors = req.session.errors || {};
	req.session.errors ={};
	res.render('sessions/new', {errors: errors});
};

// POST /login -- crear la sesion
exports.create = function (req,res){
	
	var login = req.body.login;
	var password = req.body.password;
	
	var useController =  require('./user_controller');
	
	useController.autenticar(login, password, function(error, user){
		// Si hay errores devolvemos mensajes de error de sesion
		if(error){ 
			req.session.errors = [{"message": '"'+error+'"'}];
			res.redirect('/login');
			return;
		}
		// Crear req.session.user y guardar campos id y username
		// La sesion se define por la existencia de: req.session.user
		req.session.user = {id:user.id, username:user.username};
		
		res.redirect(req.session.redir.toString());//redireccion a path anterior a login
	});
};

// DELETE /logout destruir sesion
exports.destroy = function(req,res){
  delete req.session.user;
  res.redirect(req.session.redir.toString()); // redirect a path anterior a login
};