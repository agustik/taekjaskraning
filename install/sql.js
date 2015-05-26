
module.exports = {
	exec : function (query, values, callback){
		//console.log('querying', query);
		  connectionpool.getConnection(function(err, connection) {
		  connection.config.queryFormat = function (query, values) {
	  	if (!values) return query;
	  		return query.replace(/\:(\w+)/g, function (txt, key) {
	    		if (values.hasOwnProperty(key)) {
	      			return this.escape(values[key]);
	    		}
	    		return txt;
	  		}.bind(this));
		};
        if (err) {
            
            console.error('CONNECTION error: ',err);
        	callback(err);
        } else {
            connection.query(query, values, function(err, rows, fields) {
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
		var data = {
			id : id
		}
		switch (command){
			case 'activity':
				query = "DELETE FROM activity WHERE id=:id";
				_root.exec(query, data, callback);
			break;
		}
	},
	insert : function (command, body, callback){
		var data = {};
		var _root = this;
		var report = {};
		var id;
		switch (command) {
			case 'activity':
				data.date 	= (body.date) 		? body.date : "";
				data.driver = (body.driver) 	? body.driver.id : "";
				data.km 	= (body.km) 		? body.km : "";
				data.notkun = 0;
				data.oil 	= (body.oil) 		? body.oil : "";
				data.other 	= (body.other) 		? body.other : "";
				data.state 	= (body.state) 		? body.state.id : "";
				data.taeki 	= (body.taeki) 		? body.taeki.id : "";
				data.ath 	= (body.ath) 		? body.ath : "";
				data.title 	= (body.title) 		? body.title : "";
				data.klst 	= (body.klst) 		? body.klst : 0;

			query = "INSERT INTO activity (driver, km, state, taeki, oil, ath, title, klst, date, notkun) VALUE (:driver, :km, :state, :taeki, :oil, :ath, :title, :klst, FROM_UNIXTIME('"+data.date+"'), :notkun)";
			_root.exec(query, data, function (err, sql_data){
				if (err){
					callback(err);
				}else{
                    report.insertId = sql_data.insertId;
					report.activity = sql_data;
					var id = sql_data.insertId;
					var l = body.selectedPassengers.length -1;
					body.selectedPassengers.forEach(function (value, key){
						_root.exec("INSERT INTO user_activity (user_id, activity_id) VALUE (:user_id, :activity_id)", { user_id : value.id, activity_id : id }, function (err, sql_data_1){
							if(err){
								callback(err);
							}
							if(key == l) {
								report.user_activity = [];
								report.user_activity.push(sql_data_1);
								var n_length = body.notkun.length - 1;
								body.notkun.forEach(function (v,k){
									_root.exec("INSERT INTO notkun_activity (activity_id, notkun_id ) VALUE (:activity_id, :notkun_id)", {activity_id : id, notkun_id:v.id }, function (err, sql_data_2){
										report.notkun_activity = [];
										report.notkun_activity.push(sql_data_2);
										if (err){
											callback(err);
										}else{
											if(k == n_length ){
												report.notkun_activity = sql_data_2;
												callback(err, report);
											}
										}
									});
								})
							}
						});	
					});
				}
			}); 
			return;
			break;
			case 'drivers':
				data.name = body.name;
				data.description = '';
				_root.exec("SELECT * FROM drivers WHERE name=:name LIMIT 1", data, function (err, sql_data){
					if(err){
						callback(err);
					}else{
						if (sql_data.length > 0){
							callback('Villa!: Notandi þegar til');
						}else{
							query = "INSERT INTO drivers (name, description) VALUES ( :name, :description )";
							_root.exec(query, data, callback);
						}

					}
				});
			break;
			case 'notkun': 
				data.name = body.name;
				data.ath_required = body.ath_required;
				query = "INSERT INTO notkun (name, ath_required) VALUES ( :name, :ath_required )"
				_root.exec(query, data, callback); 
				return;
			break;
			case 'passengers': 
				data.name = body.name;
				data.table = "notkun";
				//query = "INSERT INTO " +data.table+ "(name, ath_required) VALUES ('"+data.name+"', '"+data.ath_required+"' )"
				//_root.exec(query, callback); 
				callback(null, 'x');
				return;
			break;	
		}
	},
	_select_query_attrs : function (value, available){
		var type = typeof available;
		switch (type){
			case 'string':
				if (typeof value == 'number' && available == 'int'){
					return value;
				}else{
					return false;
				}
			break;
			case 'object':
				value = value.toLowerCase();
				if (available.indexOf(value) !== -1 ){
					return value;
				}else {
					return false;
				}

			break;
			default:
				return false;
			break;
		}
	},
	select : function (command, id, q, callback){
		id =  (id) ? id : false;
		var where = "";
		var _root = this;
		if (id){
			where = "WHERE id = :id"; 
		}

		var data = {
			id : id
		};
		var x = {
			offset : _root._select_query_attrs(((q.offset) ? q.offset : 0), 'int'),
			limit  : _root._select_query_attrs(((q.limit) ? q.limit : 100), 'int'),
			order  : _root._select_query_attrs(((q.order) ? q.order : 'ASC') , ['asc','desc'])
		};

		for (index in x ) {
			value = x[index];
			if(value === false){
				callback ('Key:'+index+' is invalid');
				return;
			}
			
		}
		switch (command){
	  		case 'drivers':
	  			table = "drivers";
	  			query = 'SELECT * FROM drivers '+where+' ORDER BY name '+x.order+' LIMIT ' + x.limit + ' OFFSET ' +x.offset ;
	  			_root.exec(query, data, callback); 
	  			return;
	  		break;
			case 'activity':
	  			table = "activity";
	  			if (id) {
	  				where = "WHERE a.id = " + id;
	  			}
	  			if (!q.order) {
	  				x.order = 'DESC';
	  			}
	  			query = 'SELECT a.title, a.klst, a.id, a.oil, a.date AS date, n.name AS notkun, a.ath, a.timestamp,  d.name AS driver,  s.name AS state, t.name AS taeki, t.id AS taeki_id, a.km FROM activity a LEFT JOIN notkun n ON a.notkun = n.id LEFT JOIN drivers d ON a.driver = d.id LEFT JOIN state s ON a.state = s.id LEFT JOIN taeki t ON a.taeki = t.id '+where+' ORDER BY a.timestamp '+x.order+' LIMIT '+x.limit+' OFFSET ' +x.offset;
	  			_root.exec(query, data, function (err, sql_data){
	  				var id;
	  				//console.log(err, sql_data);

	  				if(err){
	  					callback(err);
	  				}else{
	  					sql_data.forEach(function (row, i){
	  						_root.exec("SELECT * FROM `user_activity` ua LEFT JOIN drivers d ON ua.user_id=d.id WHERE activity_id=:activity_id", {activity_id : row.id }, function (err_1, sql_data_1){
	  							if (err_1){
	  								callback(err_1);
	  							}else{
	  								sql_data[i].passengers=sql_data_1;
	  								//if( i ==sql_data.length -1 ){
  									_root.exec("SELECT * FROM `notkun_activity` na LEFT JOIN notkun n ON na.notkun_id=n.id WHERE activity_id=:activity_id", {activity_id : row.id}, function (err_2, sql_data_2){
			  							if (err_2){
			  								callback(err_2);
			  							}else{
			  								sql_data[i].notkun=sql_data_2;
			  								if( i ==sql_data.length -1 ){
			  									
			  									callback(err, sql_data);
			  								}
			  							}
			  						});
	  								//}
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
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY id '+x.order+' LIMIT ' + x.limit +' OFFSET ' +x.offset ;
	  			_root.exec(query, data, callback); 
	  			return;
	  		break;
			case 'select_activity_by_taeki_id':
	  			table = "activity";

	  			query = 'SELECT a.id AS activity_id, a.state, a.timestamp AS activity_timestamp, a.ath, t.name, a.km, a.oil, a.date, t.id AS taeki_id FROM activity a LEFT JOIN taeki t ON t.id=a.taeki WHERE t.id='+id+' ORDER BY a.timestamp ' + x.order + ' LIMIT ' +x.limit+' OFFSET '+ x.offset;
	  			_root.exec(query, data, callback); 
	  			return;
	  		break;
	  		case 'state':
	  			table = "state";

	  			query = 'SELECT * FROM '+table+' ORDER BY id ' + x.order + ' LIMIT ' +x.limit+' OFFSET '+ x.offset;
	  			_root.exec(query, data, callback); 
	  			return;
	  		break;
			case 'taeki':
	  			table = "taeki";
	  			query = 'SELECT * FROM '+table+' '+where+' ORDER BY id '+x.order+' LIMIT ' + x.limit + ' OFFSET ' +x.offset;
	  			_root.exec(query, data, callback); 
	  			return;
	  		break;
		}
	}
	
}
