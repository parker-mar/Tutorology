angular.module('MyApp.requests', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/requests', {
            templateUrl: 'js/app/requests/requests.html',
            controller: 'RequestsController'
        });
}])

.controller("RequestsController", ['$scope','$http','$rootScope', function($scope, $http, $rootScope) {

	$scope.noResponseClass = 'bg-info';
	$scope.acceptResponseClass = 'bg-success';
	$scope.denyResponseClass = 'bg-danger';

	$scope.panelClick = function (panel){
        panel.active = !panel.active;
    };

	if ($rootScope.actor){
		if ($rootScope.actor.userType === 'Students'){
			$scope.userType = $rootScope.actor.userType;
			$http.get("/api/students/" +  $rootScope.actor._id + "/requests").then(
	            function successCallback(res){
	            		console.log("THIS is the requests controller http response")
	                    $scope.requests = res.data.data;
	                    $scope.requests = [{n: 1}, {n: 2}, {n: 3}]
	                    console.log($scope.requests);
	                    $scope.requests.forEach(function(req){
	                        req.active = false;
	                    });

	                });

		} else {
			window.location.href = '/#/';
		}

	} else {
		window.location.href = '/#/';
	}


}]);
