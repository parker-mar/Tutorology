/**
 * Created by ahmedel-baz on 15-11-05.
 */
angular.module('MyApp.landing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'js/app/landing/landing.html',
            controller: 'LandingController'
        });
}])

.controller("LandingController", ['$scope','$http', function($scope,$http) {
    // Redirects to the home page if user is already logged in.
    $http.get('/api/actor').then(
        function successCallback(res){
            window.location.href = '/#/home';
        },
        function errorCallback(res){
            //trigger error message here.
        }
    );
}]);