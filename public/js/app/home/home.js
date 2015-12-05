/**
 * Created by ahmedel-baz on 15-11-05.
 */
angular.module('MyApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/admin', {
            templateUrl: 'js/app/home/home.html',
            controller: 'AdminController'
        });
}])

.controller("AdminController", ['$scope','$http','$rootScope', function($scope,$http,$rootScope) {
    $scope.users = [];
    $scope.clicking = function (user){
        window.location.href = '/#/users/'+user._id+'/profile';
    };

    // Redirects to the landing page if the user is not signed in.
    $http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;

            if ($rootScope.actor.authorization === 'User') {
                window.location.href = '/#/';
            }
            // Gets all the users in the database
            $http.get('/api/users').then(
                function successCallback(res){
                    $scope.users = res.data.data;
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
}]);