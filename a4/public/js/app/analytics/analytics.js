/**
 * Created by ahmedel-baz on 15-11-08.
 */
angular.module('MyApp.analytics', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/analytics', {
                templateUrl: 'js/app/analytics/analytics.html',
                controller: 'AnalyticsController'
            });
    }])

    .controller("AnalyticsController", ['$scope','$http','$routeParams','$rootScope','$filter', function($scope,$http,$routeParams,$rootScope,$filter) {
        $scope.activities = {};
        $scope.connections = {};

        // If user is not signed in or is not an administrator, redirects to the landing page or home page respectively.
        $http.get('/api/actor').then(
            function successCallback(res){
                $rootScope.actor = res.data.data;
                if($rootScope.actor.authorization=="User"){
                    window.location.href = "/#/";
                }
                $http.get('/api/activities').then(
                    function successCallback(res){
                        $scope.activities = res.data.data;
                        $scope.activities.forEach(function(activity){
                            activity.time = Date.parse(activity.created_at);
                            activity.time_formatted = $filter('date')(activity.time,'medium');

                            $http.get('/api/connections').then(
                                function successCallback(res){
                                    $scope.connections = res.data.data;
                                    $scope.userViews = setupMostViewed();
                                    setupConnections();
                                },
                                function errorCallback(res){
                                    //trigger error message here.
                                }
                            );
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

        // Sets up the profile view counts and returns the 5 profiles with the largest number of views.
        function setupMostViewed() {
            var views = $filter('filter')($scope.activities,{type:'view_user'});
            var userViews = {};
            views.forEach(function(view){
                if(!userViews[view.target._id])
                    userViews[view.target._id] = {id:view.target._id,email:view.target.email,displayName:view.target.displayName,count:0};
                userViews[view.target._id].count++;
            });

            var userViewsArray = [];
            for (var key in userViews)
                userViewsArray.push(userViews[key]);

            return userViewsArray.slice(0,5);
        }

        // Sets up all the connections and formats the data in an iterable and filterable form.
        function setupConnections() {
            $scope.totalDeviceCount = 0;
            $scope.totalBrowserCount = 0;
            $scope.totalOSCount = 0;
            var devices = {};
            var operatingSystems = {};
            var browsers = {};
            $scope.connections.forEach(function(connection){
                if(connection.device) {
                    if(!devices[connection.device.vendor])
                        devices[connection.device.vendor] = {device: connection.device.vendor, count:0};
                    devices[connection.device.vendor].count++;
                    $scope.totalDeviceCount++;
                }
                if(!browsers[connection.browser])
                    browsers[connection.browser] = {browser: connection.browser, count:0};
                browsers[connection.browser].count++;
                if(!operatingSystems[connection.os])
                    operatingSystems[connection.os] = {os: connection.os, count:0};
                operatingSystems[connection.os].count++;
                $scope.totalBrowserCount++;
                $scope.totalOSCount++;
            });

            $scope.operatingSystems = [];
            $scope.browsers = [];
            $scope.devices = [];
            for (var key in operatingSystems)
                $scope.operatingSystems.push(operatingSystems[key]);
            for (var key in browsers)
                $scope.browsers.push(browsers[key]);
            for (var key in devices)
                $scope.devices.push(devices[key]);
        }

    }]);