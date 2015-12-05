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
	$scope.topicName = "";
	$scope.requestMessage = '';

	
	$http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;
			if ($rootScope.actor.userType === 'Students'){
				$scope.userType = $rootScope.actor.userType;
				$http.get("/api/tutors/" + $routeParams.tutorId).then(function sucessCallback (res){
					$scope.tutor = res.data.data;
						
				},  function errorCallback(res){
	                //trigger error message here.
	                console.log("Error getting tutor");
	                $rootScope.displayAlert('error',res.data.message);
		        });
	
			} else {
				window.location.href = '/#/';
			}
		},  function errorCallback(res){
	                //trigger error message here.
	                console.log("Error getting actor");
	                $rootScope.displayAlert('error',res.data.message);
		    });



	$scope.sendRequest =  function(tpcName, reqMessage){
		if (reqMessage === ""){

            console.log("Attempted empty request.");
            $rootScope.displayAlert('error', "Must provide message in request.");  
		} else {
			$http.post('/api/students/'+ $rootScope.actor._id + '/requests', 
				{tutorId : $routeParams.tutorId, topicName: tpcName, message: reqMessage}).then(
					function sucessCallback (res){
						window.location.href = '/#/';
											
					}, 				

					 function errorCallback(res){
		                //trigger error message here.
		                console.log("Error sending request");
		                $rootScope.displayAlert('error',res.data.message);
			        });
		}

	};
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
