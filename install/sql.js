
module.exports = {
	exec : function (query, callback){
		//console.log('querying', query);
		  connectionpool.getConnection(function(err, connection) {
        if (err) {
        	callback(err);
            console.error('CONNECTION error: ',err);
        } else {
            connection.query(query, '', function(err, rows, fields) {
             	connection.release();
                callback(err, rows);
            });
        }
    });
	},
	update : function (command, callback){

	},
	delete : function (command, id, callback){
		var query, _root=this;

		switch (command){
			case 'activity':
				query = "DELETE FROM activity WHERE id=" +id;
				_root.exec(query, callback);
			break;
		}
	},
	insert : function (command, body, callback){
		var data = {};
		var _root = this;
		var id;
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
			_root.exec(query, function (err, sql_data){
				var id = sql_data.insertId;
				var l = body.selectedPassengers.length -1;
				body.selectedPassengers.forEach(function (value, key){
					_root.exec("INSERT INTO user_activity (user_id, activity_id) VALUE ('"+value.id+"','"+id+"')", function (err, sql_data_1){
						if(key == l) {
							callback(err, sql_data);
						}
					});	
				});
			}); 
			return;
			break;
			case 'drivers':
				data.driver = body.name;
				data.table = 'drivers';
				
				_root.exec("SELECT * FROM " + data.table + " WHERE name='"+data.driver+"' LIMIT 1", function (err, sql_data){
					if(err){
						callback(err);
					}else{
						if (sql_data.length > 0){
							callback('Villa!: Notandi þegar til');
						}else{
							query = "INSERT INTO "+data.table+" (name) VALUES ('"+data.driver+"')";
							_root.exec(query, callback);
						}

					}
				});
			break;
			case 'notkun': 
				data.name = body.name;
				data.table = "notkun";
				data.ath_required = body.ath_required;
				query = "INSERT INTO " +data.table+ "(name, ath_required) VALUES ('"+data.name+"', '"+data.ath_required+"' )"
				_root.exec(query, callback); 
				return;
			break;
			case 'passengers': 
				data.name = body.name;
				data.table = "notkun";

				console.log(data.table);
				//query = "INSERT INTO " +data.table+ "(name, ath_required) VALUES ('"+data.name+"', '"+data.ath_required+"' )"
				//_root.exec(query, callback); 
				callback(null, 'x');
				return;
			break;	
		}
	},
	select : function (command, id, callback){
		id =  (id) ? id : false;
		var where = "";
		var _root = this;
		if (id){
			where = "WHERE id = " + id;
		}
		switch (command){
	  		case 'drivers':
	  			table = "drivers";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY name ASC LIMIT 20';
	  			_root.exec(query, callback); 
	  			return;
	  		break;
			case 'activity':
	  			table = "activity";
	  			if (id) {
	  				where = "WHERE a.id = " + id;
	  			}
	  			query = 'SELECT a.id, a.oil, a.date AS date, n.name AS notkun, a.ath, a.timestamp,  d.name AS driver,  s.name AS state, t.name AS taeki, a.km FROM activity a LEFT JOIN notkun n ON a.notkun = n.id LEFT JOIN drivers d ON a.driver = d.id LEFT JOIN state s ON a.state = s.id LEFT JOIN taeki t ON a.taeki = t.id '+where+' ORDER BY a.timestamp DESC LIMIT 100';
	  			_root.exec(query, function (err, sql_data){
	  				var id;
	  				//console.log(err, sql_data);

	  				if(err){
	  					callback(err);
	  				}else{
	  					sql_data.forEach(function (row, i){
	  						id = row.id;
	  						_root.exec("SELECT * FROM `user_activity` ua LEFT JOIN drivers d ON ua.user_id=d.id WHERE activity_id='"+id+"'", function (err_1, sql_data_1){
	  							if (err_1){
	  								callback(err_1);
	  							}else{
	  								sql_data[i].passengers=sql_data_1;
	  								if( i ==sql_data.length -1 ){
	  									callback(err, sql_data);
	  								}
	  							}
	  						});
	  						
	  					});
	  				}
	  				//callback(err, sql_data);
	  			}); 
	  			return;
	  		break;
			case 'notkun':
	  			table = "notkun";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY id ASC LIMIT 20';
	  			_root.exec(query, callback); 
	  			return;
	  		break;
			case 'state':
	  			table = "state";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY id ASC LIMIT 20';
	  			_root.exec(query, callback); 
	  			return;
	  		break;
			case 'taeki':
	  			table = "taeki";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY id ASC LIMIT 20';
	  			_root.exec(query, callback); 
	  			return;
	  		break;
		}
	}
	
}
