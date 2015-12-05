angular.module('MyApp.requests', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/requests', {
            templateUrl: 'js/app/requests/requests.html',
            controller: 'RequestsController'
        });
}])

.controller("RequestsController", ['$scope','$http','$rootScope', '$filter', function($scope, $http, $rootScope, $filter) {

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
	                    $scope.requests = res.data.data;
	                    console.log($scope.requests);
	                    $scope.requests.forEach(function(req){
	                    	req.active = false;
	                    	req.created_at = $filter('date')(req.created_at, 'medium');
	                    });	


	                });

		} else {
			window.location.href = '/#/';
		}

	} else {
		window.location.href = '/#/';
	}


}]);

