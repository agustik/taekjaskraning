var application = angular.module('taekjaskraning', ['ngSanitize', 'ui.bootstrap','ui.select']);

var io = io();

// Emit ready event.
// io.emit('activity','mjeeee'); 

// // Listen for the talk event.
// io.on('activity', function(data) {
//     console.log(data)
// });


application.controller('main', function ($scope, request, $modal, $log, $interval) {

  $scope.selected = {};
  $scope.openmodal = function (size) {
  	console.log('open  ?');

    var modalInstance = $modal.open({
      templateUrl: 'modals/create-user.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (name) {
      // request.get('drivers').then(function (res) {
      //   $scope.drivers = res.data;
      // });
      console.log(name);
      $scope.selected.driver = name;
      
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
	
	$scope.selected.passangers = 0;
	$scope.logs = [];

	request.get('taeki').then(function (res) {
		$scope.taeki = res.data;
		$scope.selected.taeki = res.data[0];
	});

	request.get('notkun').then(function (res) {
		$scope.notkun = res.data;
		$scope.selected.notkun = res.data[0];
	});

	request.get('drivers').then(function (res) {
		$scope.drivers = res.data;
	});

	request.get('state').then(function (res) {
		$scope.state = res.data;
		$scope.selected.state = res.data[0];
	});

  request.get('activity').then(function (res) {
    $scope.activity=res.data;
  });

  io.on('update', function(ws) {
    console.log(ws);
    request.get(ws.name+'/'+ws.row_id).then(function (res){
      console.log(res);
      if(res.status=='success'){
        $scope[ws.name].push(res.data[0]);
      }
    })
    
    //$scope.data.push(data.data);
  });

  io.on('select', function(data) {
    console.log(data)
  });
  $scope.predicate = 'id';
  $scope.reverse = true;

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
    console.log('submit ? ');
  	$scope.selected.date = Date.parse($scope.dt) / 1000;
  	request.put('activity', $scope.selected);
  }
});

application.service('request', function ($http, $q){
	return {
	 get: function(collection){
        var deferred = $q.defer();
 
        $http.get('api/'+collection).success(function(data){
          deferred.resolve(data);
      	}).error(function(){
 
        deferred.reject("An error occured while fetching items");
      });
 		//console.log(deferred.promise);
      return deferred.promise;
    },
    post: function(collection, post){
        var deferred = $q.defer();
 
        $http.post('api/'+collection, post).success(function(data){
          deferred.resolve(data);
      	}).error(function(){
 
        deferred.reject("An error occured while fetching items");
      });
 		//console.log(deferred.promise);
      return deferred.promise;
    },
    put: function(collection, put){

    	console.log(put);
        var deferred = $q.defer();
 
        $http.put('api/'+collection, put).success(function(data){
          deferred.resolve(data);
      	}).error(function(){
 
        deferred.reject("An error occured while fetching items");
      });
 		//console.log(deferred.promise);
      return deferred.promise;
    }
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

application.controller('ModalInstanceCtrl', function (request, $scope, $modalInstance) {

  $scope.save = function (){
    if($scope.NewDriver !== ""){
    	request.put('drivers', {name : $scope.NewDriver }).then(function (res){
        	console.log(res);
         if (res.status=="success"){
          $scope.NewDriver ="";
         }
      });
      
    }
  }
  $scope.ok = function () {
    $modalInstance.close($scope.NewDriver);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
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