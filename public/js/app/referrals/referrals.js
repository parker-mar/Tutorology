angular.module('MyApp.referrals', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/referrals', {
            templateUrl: 'js/app/referrals/referrals.html',
            controller: 'ReferralsController'
        });
}])
.controller("ReferralsController", ['$scope','$http','$rootScope', '$filter', function($scope, $http, $rootScope, $filter) {

	$http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;
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
                            	},function errorCallback(res){
						            //trigger error message here.
						            console.log("Failed setting referral as read.");
						            $rootScope.displayAlert('error',res.data.message);
						        });
                        });
					}, function errorCallback(res){
				            //trigger error message here.
				            console.log("Failed referrals");
				            $rootScope.displayAlert('error', res.data.message);
				        });

			} else {
				window.location.href = '/#/';
			}
		},   
		function errorCallback(res){
            //trigger error message here.
            console.log("Failed Getting actor");
            $rootScope.displayAlert('error',res.data.message);
        });
}]);