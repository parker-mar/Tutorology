angular.module('MyApp.referrals', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/referrals', {
            templateUrl: 'js/app/referrals/referrals.html',
            controller: 'ReferralsController'
        });
}])
.controller("ReferralsController", ['$scope','$http','$rootScope', '$filter', function($scope, $http, $rootScope, $filter) {


	if ($rootScope.actor){
		if ($rootScope.actor.userType === 'Students'){
			$scope.userType = $rootScope.actor.userType;
			$http.get("/api/students/" +  $rootScope.actor._id + "/referrals").then(
	            function successCallback(res){
	            		
	                    $scope.referrals = res.data.data;
	                   	$scope.referrals.forEach(function(ref){
	                   		ref.created_at = $filter('date')(ref.created_at, 'medium');
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