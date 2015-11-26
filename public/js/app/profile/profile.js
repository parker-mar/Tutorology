/**
 * Created by ahmedel-baz on 15-11-05.
 */
angular.module('MyApp.profile', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/users/:userId/profile', {
            templateUrl: 'js/app/profile/profile.html',
            controller: 'ProfileController'
        });
}])

.controller("ProfileController", ['$scope','$http','$routeParams','$rootScope','$filter', function($scope,$http,$routeParams,$rootScope,$filter) {
    $scope.user = {};

    // Redirects to the landing page if user is not logged in.
    $http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;

            // Gets all the user's information.
            $http.get('/api/users/'+$routeParams.userId).then(
                function successCallback(res){
                    $scope.user = res.data.data;
                    $scope.user.activities.forEach(function(activity){
                        activity.tfe = Date.parse(activity.created_at);
                        activity.time_formatted = $filter('date')(activity.time,'medium');
                    });
                },
                function errorCallback(res){
                    //trigger error message here.
                }
            );
        },
        function errorCallback(res){
            //trigger error message here.
            window.location.href = '/#/';
        }
    );

    // Navigates to profile editing page when called.
    $scope.editUser = function () {
        // window.location.href = '/#/users/'+ $routeParams.userId +'/profile/edit';
        go('/#/users/'+ $routeParams.userId +'/profile/edit');
    };

    // Deletes the target user when called.
    $scope.deleteUser = function () {
        $http.delete('/api/users/'+$scope.user._id).then(
            function successCallback(res) {
                window.location.href = '/#/';
                $rootScope.displayAlert('success','User has been successfully deleted.');
            },
            function errorCallback(res) {
                //trigger error message here.
                $rootScope.displayAlert('error',res.data.message);
            }
        );
    };

    // Promotes the user to "Admin" authorization level when called.
    $scope.makeUserAdmin = function () {
        $scope.user.authorization = "Admin";
        $http.post('/api/users/'+$scope.user._id+'/setadmin',$scope.user).then(
            function successCallback(res) {
                $rootScope.displayAlert('success','User has been promoted to Admin.');
            },
            function errorCallback(res) {
                //trigger error message here.
                $rootScope.displayAlert('error',res.data.message);
            }
        );
    };

    // Demotes the user to "User" authorization level when called.
    $scope.demoteToUser = function () {
        $scope.user.authorization = "User";
        $http.post('/api/users/'+$scope.user._id+'/setadmin',$scope.user).then(
            function successCallback(res) {
                $rootScope.displayAlert('success','User has been demoted.');
            },
            function errorCallback(res) {
                //trigger error message here.
                $rootScope.displayAlert('error',res.data.message);
            }
        );
    };
}]);