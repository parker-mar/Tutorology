/**
 * Created by ahmedel-baz on 15-11-05.
 */
angular.module('MyApp', [
    'ngRoute',
    'base64',
    'confirmPassValidation',
    'MyApp.edit-profile',
    'MyApp.home',
    'MyApp.landing',
    'MyApp.login',
    'MyApp.profile',
    'MyApp.signup',
    'MyApp.analytics',
    'MyApp.dashboard',
    'MyApp.requests'
])

.config(['$routeProvider', function($routeProvider) {
    // Catches any invalid routes and redirects to landing page.
    $routeProvider
        .otherwise({
            redirectTo: '/'
        });
}])

// Sets up some global methods to be called from any controller.
.run(['$rootScope','$http','$timeout', function($rootScope,$http,$timeout){

    // Log out the signed in user when called.
    $rootScope.logout = function(){
        $http.post('/api/logout').then(
            function successCallback(res){
                delete $rootScope.actor;
                window.location.href = '/#/';
            },
            function errorCallback(res){
                //trigger error message here.
            }
        );
    };

    // Displays an alert with the given message when called
    // @param {String} type     The type of alert to be produced. Accepted values include "success" and "error".
    // @param {String} message  The message to be printed in the alert.
    $rootScope.displayAlert = function(type,message) {
        $rootScope.alert = {message:message,type:type};
        if($rootScope.dismissTimer)
            $timeout.cancel($rootScope.dismissTimer);
        $rootScope.dismissTimer = $timeout(function(){
            $rootScope.dismiss();
        },3000);
    };

    // Dismisses any visible alerts when called.
    $rootScope.dismiss = function(){
        if($rootScope.alert)
            delete $rootScope.alert;
    }
}])

// Added new filter to uniquely list items in connections resource.
// Filter is based on angular.ui
// If 'filterOn' argument is undefined, whole object is compared, otherwise field is compared.
.filter('unique', function () {

    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
});