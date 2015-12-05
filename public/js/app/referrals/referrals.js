angular.module('MyApp.referrals', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/referrals', {
            templateUrl: 'js/app/referrals/referrals.html',
            controller: 'ReferralsController'
        });
}])
.controller("ReferralsController", ['$scope','$http','$rootScope', function($scope, $http, $rootScope) {


	if ($rootScope.actor){
		if ($rootScope.actor.userType === 'Students'){
			$scope.userType = $rootScope.actor.userType;
			$http.get("/api/students/" +  $rootScope.actor._id + "/referrals").then(
	            function successCallback(res){
	            		
	                    $scope.referrals = res.data.data;
	                   	$scope.referrals.forEach(function(ref){
                            $http.put("/api/students/"+  $rootScope.actor._id + "/referrals/" + ref._id, {isRead: true}).then(
                            	function successCallback(res){
                            		ref.isRead = true;
                            	});
                        });

	                });

		} else {
			window.location.href = '/#/';
		}

	} else {
		window.location.href = '/#/';
	}

}]);