var application = angular.module('taekjaskraning', ['ngSanitize', 'ui.bootstrap','ui.select','datarefresh']);


application.controller('main', function ($scope, request, $modal, $log) {

  

  $scope.items = ['item1', 'item2', 'item3'];

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
      request.get('drivers').then(function (res) {
        $scope.drivers = res.data;
      });
      
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
	$scope.selected = {};
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
  	request.put('drivers', {name : $scope.NewDriver }).then(function (res){
      	console.log(res);
      });
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