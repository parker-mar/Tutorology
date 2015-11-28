angular.module('MyApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'js/app/dash/dash.html',
            controller: 'DashController'
        });
}])

.controller("LoginController", ['$scope','$http','$rootScope', function($scope,$http,$rootScope) {


}]);