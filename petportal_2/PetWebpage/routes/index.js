var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('home', {
    user: req.session.user || null  
  });
});


module.exports = router;
