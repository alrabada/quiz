var models = require('../models/models.js');
var Promise = require('promise');

//autoload- factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(
		{
			where:{ id: Number(quizId)},
			include: [{model: models.Comment}]
		}
	).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId)); }
		}
	).catch(function(error) { next(error);});
};

//autoload :id de comentarios
exports.load = function(req, res, next, commentId){
	models.Comment.find({
		where: {
			id: Number(commentId)
		}
	}).then(function(comment){
			if(comment){
				req.comment = comment;
				next();
			}else{
				next(new Error('No existe commentId= '+commentId))
			}
		}
	).catch(function(error){next(error)});
};

// GET /quizes
exports.index = function(req, res) {
	
	if(req.query.search){
		var search = "%"+req.query.search+"%";
		search = search.trim().replace(/\s/g,"%");
		search = search.toUpperCase();
		models.Quiz.findAll({where: ["upper(pregunta) like ?", search], order: 'pregunta ASC'}).then(
			function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: []});
			}
		).catch(function(error) { next(error);})
	}
	else{
		models.Quiz.findAll().then(
			function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: []});
			}
		).catch(function(error) { next(error);})
	}
};



// GET /quizes/statistics index
exports.index = function(req, res) {
	var resultado = function(preguntas, comentarios, media_comentarios, preguntas_con_comentarios, preguntas_sin_comentarios){
		this.preguntas = preguntas;
		this.comentarios = comentarios;
		this.media_comentarios = media_comentarios;
		this.preguntas_con_comentarios = preguntas_con_comentarios;
		this.preguntas_sin_comentarios = preguntas_sin_comentarios;
	}
	resultado.preguntas					= 0;
	resultado.comentarios				= 0;
	resultado.media_comentarios 		= 0;
	resultado.preguntas_con_comentarios = 0;
	resultado.preguntas_sin_comentarios = 0;
	
	Promise.all([
		models.Quiz.count(),
		models.Comment.count(),
		models.Quiz.findAll({
			include: [{
				model: models.Comment
			}]
		})
	]).then(function(resultados){
		resultado.preguntas				= resultados[0];
		resultado.comentarios			= resultados[1];
		resultado.media_comentarios		= (resultado.comentarios/resultado.preguntas).toFixed(1);
		var listado_comentarios_aux		= resultados[2];
		for (var i in listado_comentarios_aux){
			if(listado_comentarios_aux[i].Comments.length)
				resultado.preguntas_con_comentarios++;
			else
				resultado.preguntas_sin_comentarios++;
		}

		res.render('quizes/statistics.ejs', {estadistica: resultado, errors: []});
	}).catch(function(error) {next(error)});


};
