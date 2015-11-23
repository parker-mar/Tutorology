/**
 * Created by ahmedel-baz on 15-11-05.
 */
angular.module('MyApp.signup', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/signup', {
            templateUrl: 'js/app/signup/signup.html',
            controller: 'SignupController'
        });
}])

.controller("SignupController", ['$scope','$http','$rootScope', function($scope,$http,$rootScope) {
    $scope.registerInfo = {};

    // Redirects to the home page if user is already logged in.
    $http.get('/api/actor').then(
        function successCallback(res){
            window.location.href = '/#/home';
        },
        function errorCallback(res){
            //trigger error message here.
        }
    );

    // Registers the user when called.
    $scope.signUp = function() {
        $(".error").hide();
        $http.post('/api/register',$scope.registerInfo).then(
            function successCallback(res){
                window.location.href = '/#/home';
            },
            function errorCallback(res){
                //trigger error message here.
                console.log('Signup error:' + res.data.message);
                $rootScope.displayAlert('error',res.data.message);
            }
        );
    };
}]);