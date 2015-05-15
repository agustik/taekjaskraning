var application = angular.module('taekjaskraning', ['ngSanitize', 'ui.bootstrap','ui.select']);

var io = io();

application.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});

application.controller('main', function ($scope, $filter, request, $modal, $log, $interval) {

  $scope.selected = {};
  $scope.openmodal = function (size,  template, controller, index) {
    var modalInstance = $modal.open({
      templateUrl: 'modals/'+template,
      controller: controller,
      size: size,
      resolve : {
        log : function (){
          return {
            data : $scope.activity,
            index : index
          } 
        }
      }
    });

    modalInstance.result.then(function (name) {
      $scope.selected.driver = name;
      
    }, function (name) {
      $log.info('Modal dismissed at: ' + new Date(), name);
      if(index == 'driver'){
        $scope.selected.driver = name;
      }
    });
  };
	
	$scope.selected.passangers = 0;
	$scope.logs = [];
  $scope.taeki = [];
  $scope.notkun = [];
  $scope.drivers=[];
  $scope.state=[];
  $scope.activity=[];
  $scope.AvailableUsers=[];
  var requests = ['taeki', 'notkun', 'drivers', 'state', 'activity'];

  requests.forEach(function (key){
    request.get(key).then(function (res) {
      if(res.status=='success'){
        $scope[key] = res.data;
        $scope.selected[key] = res.data[0];
      }else{
        $log.error(res.message);
      }
    });
  });

  $scope.$watch('drivers', function (NewValue, OldValue){
    $scope.AvailableUsers=NewValue;
  });

  /* Websocket Stuff */
  io.on('update', function(ws) {
    request.get(ws.name+'/'+ws.row_id).then(function (res){
      if(res.status=='success'){
        $scope[ws.name].push(res.data[0]);
      }
    })
  });

  io.on('delete', function(data) {
    DeleteObjectFromScopeById(data.name, data.id);
  });
  $scope.predicate = 'id';
  $scope.reverse = true;

  // $scope.$watch('selected.driver', function (NewValue, OldValue){
  //   if(NewValue == undefined) {
  //     return;
  //   }
  //   if(OldValue == undefined){
  //     angular.copy($scope.AvailableUsers, $scope.OriginalUsers);
  //   }else{
  //     $scope.AvailableUsers.push(OldValue);
  //   }
  //   console.log(OldValue, NewValue);

  //   DeleteObjectFromScopeByName('AvailableUsers', NewValue.name);
  // });

  function DeleteObjectFromScopeById(ScopeKey, id){
    var array = $scope[ScopeKey];
    array.forEach(function (value, key){
      if(value.id == id ){
        $scope[ScopeKey].splice(key,1);
      }
    });
  }

  function DeleteObjectFromScopeByName(ScopeKey, name){
    var array = $scope[ScopeKey];
    array.forEach(function (value, key){
       if(value.name == name ){
         $scope[ScopeKey].splice(key,1);
       }
    });
  }

  function CleanForm(){
    angular.forEach($scope.selected, function (value, key){
      if($scope.hasOwnProperty(key)){
        $scope.selected[key] = $scope[key][0];
      }else{
        $scope.selected[key] = "";
      }
    });
  }

	$scope.today = function() {
	    $scope.dt = new Date();
	  };
	  $scope.today();

	$scope.open = function($event) {
	    $event.preventDefault();
	    $event.stopPropagation();
	    $scope.opened = true;
	  };

  $scope.format = "dd.MM.yyyy";
  $scope.submit = function (){
  	$scope.selected.date = Date.parse($scope.dt) / 1000;
  	request.put('activity', $scope.selected).then(function (data){
      if (data.status == "success") {
        CleanForm();
      }
    })
  };

  $scope.delete = function (collection, id){
    if (confirm('Ertu viss um að þú viljir eyða þessari færslu?')) {
      request.delete(collection, id).then(function (res){
        $log.info(res);
      });
    }
  };

  /* Multi user select*/
  $scope.selected.selectedPassengers = {};
});

application.service('request', function ($http, $q){
	return {
	 get: function(collection){
        var deferred = $q.defer();
 
        $http.get('api/'+collection).success(function(data){
          deferred.resolve(data);
      	}).error(function(data){
 
        //deferred.reject("An error occured while fetching items");
        deferred.resolve(data);
      });
 		//console.log(deferred.promise);
      return deferred.promise;
    },
    post: function(collection, post){
        var deferred = $q.defer();
 
        $http.post('api/'+collection, post).success(function(data){
          deferred.resolve(data);
      	}).error(function(data){
          
        //deferred.reject("An error occured while fetching items");
        deferred.resolve(data);
      });
 		//console.log(deferred.promise);
      return deferred.promise;
    },
    put: function(collection, put){
        var deferred = $q.defer();
 
        $http.put('api/'+collection, put).success(function(data){
          deferred.resolve(data);
      	}).error(function(data){
 
        //deferred.reject("An error occured while fetching items");
        deferred.resolve(data);
      });
 		//console.log(deferred.promise);
      return deferred.promise;
    },
    delete: function(collection, del){
        var deferred = $q.defer();
 
        $http.delete('api/'+collection+'/'+del).success(function(data){
          deferred.resolve(data);
        }).error(function(data){
 
        //deferred.reject("An error occured while fetching items");
        deferred.resolve(data);
      });
    //console.log(deferred.promise);
      return deferred.promise;
    }
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

application.controller('DriverModalController', function (log, request, $scope, $modalInstance) {
  $scope.selectedDriver='';
  $scope.show=false;
  $scope.status="";
  $scope.statusClass='alert-error';
  $scope.save = function (){
    if($scope.NewDriver !== undefined){
      $scope.selectedDriver=$scope.NewDriver;
      request.put('drivers', {name : $scope.NewDriver }).then(function (res){
         if (res.status=="success"){
          $scope.NewDriver ="";
          $scope.show=true;
          $scope.statusClass='alert-success';
          $scope.status='Aðgerð heppnaðist';
         }else{
          $scope.statusClass='alert-danger';
          $scope.show=true;
          $scope.status=res.message;
         }
      });
      
    }else{
      $scope.statusClass='alert-danger';
          $scope.show=true;
          $scope.status="Notandanafn vantar";
    }
  }
  $scope.ok = function () {
    $modalInstance.close($scope.selectedDriver);
  };
});

application.controller('LogModalController', function (log, request, $scope, $modalInstance) {
  $scope.data = log.data[log.index];
  $scope.data.consuption = ($scope.data.oil / $scope.data.km).toFixed(2);
  $scope.ok = function () {
    $modalInstance.close();
  };

  request.get('select_activity_by_taeki_id/'+$scope.data.taeki_id +"?order=DESC" ).then(function(data){
    if(data.status=='success'){
      $scope.lastUsage = data.data[1];
      $scope.data.km_diff = ( $scope.data.km - $scope.lastUsage.km);
      $scope.data.oil_usage = ($scope.data.oil / $scope.data.km_diff);
    }
  });
});

application.directive('onlyDigits', function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function (scope, element, attr, ctrl) {
      function inputValue(val) {
        if (val) {
          var digits = val.replace(/[^0-9]/g, '');

          if (digits !== val) {
            ctrl.$setViewValue(digits);
            ctrl.$render();
          }
          return parseInt(digits,10);
        }
        return undefined;
      }            
      ctrl.$parsers.push(inputValue);
    }
  };
 });