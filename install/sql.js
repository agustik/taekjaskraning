
module.exports = {
	exec : function (query, res, callback){
		//console.log('querying', query);
		  connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ',err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err:    err.code
            });
        } else {
            connection.query(query, '', function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        status: 'fail',
                        message:    err.code
                    });
                }else{

	                res.send({
	                    status: 'success',
	                    data: rows
	                });
	                if(callback){
                		callback(rows);
                	}
                }
                connection.release();
            });
        }
    });
	},
	update : function (command, res){

	},
	insert : function (command, body, res, callback){
		var data = {};
		switch (command) {
			case 'activity':
				data.table = 'activity';
				data.date 	= (body.date) 		? body.date : "";
				data.driver = (body.driver) 	? body.driver.id : "";
				data.km 	= (body.km) 		? body.km : "";
				data.notkun = (body.notkun) 	? body.notkun.id : "";
				data.oil 	= (body.oil) 		? body.oil : "";
				data.other 	= (body.other) 		? body.other : "";
				data.state 	= (body.state) 		? body.state.id : "";
				data.taeki 	= (body.taeki) 		? body.taeki.id : "";
				data.ath 	= (body.ath) 		? body.ath : "";

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
				data.driver = body.name;
				data.table = 'drivers';
				query = "INSERT INTO "+data.table+" (name) VALUES ('"+data.driver+"')";
			break;
			case 'notkun': 
				data.name = body.name;
				data.table = "notkun";
				data.ath_required = body.ath_required;
				query = "INSERT INTO " +data.table+ "(name, ath_required) VALUES ('"+data.name+"', '"+data.ath_required+"' )"
			break;
		}
		this.exec(query, res, callback);
	},
	select : function (command, res, id){
		id =  (id) ? id : false;
		var where = "";
		if (id){
			where = "WHERE id = " + id;
		}
		switch (command){
	  		case 'drivers':
	  			table = "drivers";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY name ASC LIMIT 20';
	  		break;
			case 'activity':
	  			table = "activity";
	  			if (id) {
	  				where = "WHERE a.id = " + id;
	  			}
	  			query = 'SELECT a.id, a.oil, a.date AS date, n.name AS notkun, a.ath, a.timestamp,  d.name AS driver,  s.name AS state, t.name AS taeki, a.km FROM activity a LEFT JOIN notkun n ON a.notkun = n.id LEFT JOIN drivers d ON a.driver = d.id LEFT JOIN state s ON a.state = s.id LEFT JOIN taeki t ON a.taeki = t.id '+where+' ORDER BY a.timestamp DESC LIMIT 100';
	  		break;
			case 'notkun':
	  			table = "notkun";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY id ASC LIMIT 20';
	  		break;
			case 'state':
	  			table = "state";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY id ASC LIMIT 20';
	  		break;
			case 'taeki':
	  			table = "taeki";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY id ASC LIMIT 20';
	  		break;
		}
		this.exec(query, res);
	}
	
}
