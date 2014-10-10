var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = require('./config.json');
var mysql = require('mysql');
var sql = require('./sql');
var bodyParser = require('body-parser');

connectionpool = mysql.createPool(config.mysql);


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
io.on('connection', function(socket){
  socket.on('activity', function(msg){
    io.emit('activity', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.get('/api/:command', function (req, res) {
	console.log(req.params.command);
	io.emit('select', req.params.command);
	sql.select(req.params.command, res);
});

app.get('/api/:command/:id', function (req, res) {
	sql.select(req.params.command, res,  req.params.id);
});

app.put('/api/:command', function (req, res) {
	var body = req.body;
	
	console.log(body);
	sql.insert(req.params.command, body, res, function (row){
		console.log('returned id : ', row.insertId);
		io.emit('update', { name: req.params.command, data: body, row_id : row.insertId });
	});
	
});



// app.use(favicon());
// app.use(logger('dev'));





module.exports = app;



