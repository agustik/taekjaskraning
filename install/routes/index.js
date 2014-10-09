var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var utf8 = require('utf8');
var config = require('../config.json');
connectionpool = mysql.createPool(config.mysql);

/* GET home page. */
router.get('/api', function (req, res) {
	res.send( { hola : 'me'}); 
});

router.get('/api/:action', function (req, res) {

  
  connectionpool.getConnection(function(err, connection) {
  	var table = "";
  	var query = "";

  	switch (req.params.action){
  		case 'drivers':
  			table = "drivers";
  			query = 'SELECT * FROM '+table+' ORDER BY id ASC LIMIT 20';
  		break;
		case 'activity':
  			table = "activity";
  			query = "SELECT a.oil, a.date AS date, n.name AS notkun, a.ath, a.timestamp,  d.name AS driver,  s.name AS state, t.name AS taeki, a.km FROM activity a LEFT JOIN notkun n ON a.notkun = n.id LEFT JOIN drivers d ON a.driver = d.id LEFT JOIN state s ON a.state = s.id LEFT JOIN taeki t ON a.taeki = t.id ORDER BY a.timestamp DESC LIMIT 100";

  		break;
		case 'notkun':
  			table = "notkun";
  			query = 'SELECT * FROM '+table+' ORDER BY id ASC LIMIT 20';
  		break;
		case 'state':
  			table = "state";
  			query = 'SELECT * FROM '+table+' ORDER BY id ASC LIMIT 20';
  		break;
		case 'taeki':
  			table = "taeki";
  			query = 'SELECT * FROM '+table+' ORDER BY id ASC LIMIT 20';
  		break;

  	}

        if (err) {
            console.error('CONNECTION error: ',err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err:    err.code
            });
        } else {
            connection.query(query, 
            	 req.params.id, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        status: 'fail',
                        message:    err.code
                    });
                }
                res.send({
                    status: 'success',
                    data: rows
                });
                connection.release();
            });
        }
    });
});

router.post('/api/:action/:id', function (req, res) {

	var query = "update  .. ";

	res.send( { data : res}); 
});

router.put('/api/:action', function (req, res) {
	var query = "";
	
	var data = {};
	switch (req.params.action) {
		case 'activity':
			data.table = 'activity';
			data.date 	= (req.body.date) 		? req.body.date : "";
			data.driver = (req.body.driver) 	? req.body.driver.id : "";
			data.km 	= (req.body.km) 		? req.body.km : "";
			data.notkun = (req.body.notkun) 	? req.body.notkun.id : "";
			data.oil 	= (req.body.oil) 		? req.body.oil : "";
			data.other 	= (req.body.other) 		? req.body.other : "";
			data.state 	= (req.body.state) 		? req.body.state.id : "";
			data.taeki 	= (req.body.taeki) 		? req.body.taeki.id : "";
			data.ath 	= (req.body.ath) 		? req.body.ath : "";

		query = "INSERT INTO "+data.table+" (driver, km, notkun, state, taeki, oil, ath, date) VALUE ('"+data.driver+
			"','"+data.km+
			"','"+data.notkun+
			"','"+data.state+
			"','"+data.taeki+
			"','"+data.oil+
			"','"+data.ath+
			"',FROM_UNIXTIME('"+data.date+"'))";
		break;
		case 'drivers':
			data.driver = req.body.name;
			data.table = 'drivers';
			query = "INSERT INTO "+data.table+" (name) VALUES ('"+data.driver+"')";
		break;
		case 'notkun': 
			data.name = req.body.name;
			data.table = "notkun";
			data.ath_required = req.body.ath_required;
			query = "INSERT INTO " +data.table+ "(name, ath_required) VALUES ('"+data.name+"', '"+data.ath_required+"' )"
		break;
	}




	//res.send( { data : data, body: req.body, query : query }); 
	connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ',err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err:    err.code
            });
        } else {
            connection.query(query, 
            	 data,
            	 function(err) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        status: 'fail',
                        message:    err.code
                    });
                }
                res.send({
                    status: 'success'
                });
                connection.release();
            });
        }
    });

});	

module.exports = router;
