var models = require('../models/models.js');

//autoload- factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId)); }
		}
	).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
	
	if(req.query.search){
		var search = "%"+req.query.search+"%";
		search = search.trim().replace(/\s/g,"%");
		search = search.toUpperCase();
		console.log("llego aqui 1");
		models.Quiz.findAll({where: ["upper(pregunta) like ?", search], order: 'pregunta ASC'}).then(
			function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: []});
			}
		).catch(function(error) { next(error);})
	}
	else{
		console.log("llego aqui 2");
		models.Quiz.findAll().then(
			function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: []});
			}
		).catch(function(error) { next(error);})
	}
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto, "'+req.query.respuesta+'" no es la respuesta correcta';
	if ((req.query.respuesta).toUpperCase() === (req.quiz.respuesta).toUpperCase()){
		resultado = 'Correcto';
	}
	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req,res){
	var quiz = models.Quiz.build( 
	{pregunta: "Pregunta", respuesta: "Respuesta"} //crea el objeto quiz
	);
	res.render('quizes/new',{quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req,res){
	var quiz = models.Quiz.build( req.body.quiz);
	quiz.validate()
	.then(
		function(err){
			if(err){
				res.render('quizes/new',{quiz: quiz, errors: err.errors});
			}
			else{
				//guarda en DB
				quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
				res.redirect('/quizes'); //redireccion a quizes
				})
			}
		}
	)
};