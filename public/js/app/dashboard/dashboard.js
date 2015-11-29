angular.module('MyApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'js/app/dash/dash.html',
            controller: 'DashController'
        });
}])

.controller("LoginController", ['$scope','$http','$rootScope', function($scope,$http,$rootScope) {

	//$scope.userType
	$scope.searchTerm = "";

	$scope.noResponseClass = 'background-color: #0088CC';
	$scope.acceptResponseClass = 'background-color: #51A351';
	$scope.denyResponseClass = 'background-color: #BD362F';
	// TODO - Finish HTML for student and tutor
	// sendReqest function take in req object.

	$http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;

            // If actor is student default response is to send reconmmended Tutors
            if ($rootScope.actor.userType == 'Student'){
            	$http.get('/api/getRecommendedTutors/').then(
            		function successCallback(res){
            			$scope.tutors = res;
            			$scope.userType = 'Student';
            		});

            // If actor is tutor get all requests and add attributes 
            // for display.
            } else if ($rootScope.actor.userType == 'Tutor') {
            	$http.get('/api/getRequests/').then(
            		function successCallback(res){
            			$scope.requests = res;
            			for (i = 0; i < scope.requests.length; i++){
            				scope.requests[i].active = false;
            				scope.requests[i].response = false;
            				scope.requests[i].resMessage = "";
            			}

            			$scope.userType = 'Tutor';
            		});
            }
        }
    }


}]);