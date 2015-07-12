var express = require('express');
var router = express.Router();

/* GET autor. */
router.get('/', function(req, res) {
  res.render('autor', { title: 'Autor' });
});

module.exports = router;
