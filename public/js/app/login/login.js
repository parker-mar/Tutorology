/**
 * Created by ahmedel-baz on 15-11-05.
 */
angular.module('MyApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'js/app/login/login.html',
            controller: 'LoginController'
        });
}])

.controller("LoginController", ['$scope','$http','$rootScope', function($scope,$http,$rootScope) {
    $scope.loginInfo = {};

    // Redirects to the home page if the user is already logged in.
    $http.get('/api/actor').then(
        function successCallback(res){
            window.location.href = '/#/';
        },
        function errorCallback(res){
            //trigger error message here.
        }
    );

    // Logs in the user when called.
    $scope.login = function (){
        $http.post('/api/login',$scope.loginInfo).then(
            function successCallback(res){
                window.location.href = '/#/';
            },
            function errorCallback(res){
                //trigger error message here.
                console.log('Login error:' + res.data.message);
                $rootScope.displayAlert('error',res.data.message);
            }
        );
    }
}]);