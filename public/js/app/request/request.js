angular.module('MyApp.request', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/request/:tutorId', {
            templateUrl: 'js/app/request/request.html',
            controller: 'RequestController'
        });
}])

.controller("RequestController", ['$scope','$http','$rootScope', '$routeParams', function($scope, $http, $rootScope,$routeParams) {

	$http.get("/api/tutors/" + $routeParams.tutorId).then(function sucessCallback (res){

		console.log(res.data.data);
	});

	$scope.topics = [];
	//$scope.topicID = 1;
	$scope.requestMessage = '';



	if ($rootScope.actor){
		if ($rootScope.actor.userType === 'Students'){
			$scope.userType = $rootScope.actor.userType;
			$http.get("/api/tutors/" + $routeParams.tutorId).then(function sucessCallback (res){
				$scope.tutor = res.data.data;
					
			});

		} else {
			window.location.href = '/#/';
		}

	} else {
		window.location.href = '/#/';
	}


/*
	if ($rootScope.actor){
		if ($rootScope.actor.userType === 'Students'){
			$scope.userType = $rootScope.actor.userType;
			$http.get("/api/students/" +  $rootScope.actor._id + "/requests").then(
	            function successCallback(res){
	                    $scope.requests = res.data.data;
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
*/

}]);
