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
	var response = {
		status : 'fail'
	};
	//io.emit('select', req.params.command);
	sql.select(req.params.command,false, function (err, data){
		if(err){
			response.statusCode=500;
			response.message = err;
		}else{
			response.status='success';
			response.data=data;
		}  
	    res.send(response); 
	});
});

app.get('/api/:command/:id', function (req, res) {
	var response = {
		status : 'fail'
	};
	sql.select(req.params.command, req.params.id, function (err, data){
		if(err){
			response.statusCode=500;
			response.message = err;
		}else{
			response.status='success';
			response.data=data;
		}
		res.send(response);
	});
});

app.put('/api/:command', function (req, res) {
	var body = req.body;
	var response = {
		status:'fail'
	}
	sql.insert(req.params.command, body, function (error, data){
		if(error){
			response.message=error;
			res.statusCode = 500;
		}else{
			console.log('returned id : ', data.insertId);
			io.emit('update', { name: req.params.command, data: body, row_id : data.insertId });
			response.status='success';
			response.data=body;
			response.data.$$row_id=data.insertId;
		}
		res.send(response);
	});
});

app.delete('/api/:command/:id', function (req, res){
	var command = req.params.command,
		id = req.params.id;
	var response = {
		status:'fail'
	}
	response.status='success';
	response.data=id;
	io.emit('delete', { name: command, id : id});
	res.send(response);
	// sql.delete(command, id, function (err, data){
	// 	if (err){
	// 		response.message = err;
	// 	}else{
	// 		response.status="success";
	// 		response.data=data;
	// 		io.emit('delete', { name: command, data : id});

	// 	}
	// 	res.send(response);
	// })
});



// app.use(favicon());
// app.use(logger('dev'));





module.exports = app;



