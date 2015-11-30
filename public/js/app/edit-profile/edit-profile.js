/**
 * Created by ahmedel-baz on 15-11-05.
 */
angular.module('MyApp.edit-profile', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/users/:userId/profile/edit', {
            templateUrl: 'js/app/edit-profile/edit-profile.html',
            controller: 'EditProfileController'
        });
}])

.controller("EditProfileController", ['$scope','$http','$routeParams','$rootScope','$base64', function($scope,$http,$routeParams,$rootScope,$base64) {
    $scope.user = {};
    $scope.passChange = {};
    $scope.newTopic = {};
    window.scope = $scope;

    // Redirects to landing page if the user is not signed in.
    $http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;

            // Gets all the user's information.
            $http.get('/api/users/'+$routeParams.userId).then(
                function successCallback(res){
                    $scope.user = res.data.data;
                    if($scope.user.userType == "Tutors") {
                        $http.get('/api/tutors/'+$routeParams.userId+"/topics").then(
                            function successCallback(res){
                                $scope.user.topics = res.data.data;
                            },
                            function errorCallback(res){
                                //trigger error message here.
                                console.log("Update Error");
                                $rootScope.displayAlert('error',res.data.message);
                            }
                        );
                    }
                },
                function errorCallback(res){
                    //trigger error message here.
                    console.log("Update Error");
                    $rootScope.displayAlert('error',res.data.message);
                }
            );
        },
        function errorCallback(res){
            //trigger error message here.
            window.location.href = '/#/';
        }
    );

    // Updates the target user when called.
    $scope.updating = function() {
        $(".error").hide();
        if($scope.user.profile.description.length > 500)
            $rootScope.displayAlert("error","Error: Description text exceeds maximum length of 500.");
        else if($scope.user.charge < 0 || isNaN($scope.user.charge)){
            $rootScope.displayAlert("error","Error: Rate must be a Positive number.");
        } else{
            var usertemp = {};
            angular.copy($scope.user, usertemp);
            // ensures that the image does not get sent on every request.
            delete usertemp.profile.image;
            $http.put('/api/users/' + $routeParams.userId, usertemp).then(
                function successCallback(res) {
                    //trigger error message here.
                    console.log("Update Successful");
                    $rootScope.displayAlert('success', 'User update successful!');
                },
                function errorCallback(res) {
                    //trigger error message here.
                    console.log("Update Error");
                    $rootScope.displayAlert('error', res.data.message);
                }
            );
        }
    };

    // Changes the current user's password when called.
    $scope.changePass = function() {
        $(".error").hide();
        $http.put('/api/users/' + $routeParams.userId + '/changepass', $scope.passChange).then(
            function successCallback(res) {
                //trigger error message here.
                console.log("Update Successful");
                $rootScope.displayAlert('success','Password update successful!');
            },
            function errorCallback(res) {
                //trigger error message here.
                console.log("Update Error");
                $rootScope.displayAlert('error',res.data.message);
            }
        );
    };

    // Changes the target user's image when called.
    $scope.changeImage = function() {
        var fInput = document.getElementById('file'), f = fInput.files[0], r = new FileReader();
        r.onloadend = function(e){
            var data = e.target.result;
            var base64Data = 'data:image/png;base64,' + $base64.encode(data);
            //send you binary data via $http or $resource or do anything else with it
            $http.put('/api/users/' + $routeParams.userId, {profile:{image:base64Data}}).then(
                function successCallback(res) {
                    //trigger error message here.
                    console.log("Update Successful");
                    $rootScope.displayAlert('success','Image update successful!');
                    $scope.user.profile.image = base64Data;
                    fInput.value = '';
                },
                function errorCallback(res) {
                    //trigger error message here.
                    console.log("Update Error");
                    $rootScope.displayAlert('error',res.data.message);
                    fInput.value = '';
                }
            );
        };
        r.readAsBinaryString(f);
    };

    // Redirects to the profile page when called.
    $scope.cancelling = function() {
        window.location.href = '/#/users/'+$scope.user._id+'/profile';
    };

    $scope.addTopic = function(){
        $http.post('/api/tutors/'+$scope.user._id+"/topics",$scope.newTopic).then(
            function successCallback(res) {
                //trigger error message here.
                console.log("Add Topic Successful");
                $rootScope.displayAlert('success','Topic addition successful!');
                $scope.newTopic.name = '';
                if(typeof $scope.user.topics !== 'undefined')
                $scope.user.topics.push(res.data.data);
            }, function errorCallback(res) {
                //trigger error message here.
                console.log("Update Error");
                $rootScope.displayAlert('error',res.data.message);
                $scope.newTopic.name = '';
            }
        )
    };
    $scope.removeTopic = function(topic){
        $http.delete('/api/tutors/'+$scope.user._id+"/topics/"+topic._id).then(
            function successCallback(res) {
                //trigger error message here.
                console.log("Remove Topic Successful");
                $rootScope.displayAlert('success','Topic removal successful!');
                var index = $scope.user.topics.indexOf(topic);
                $scope.user.topics.splice(index, 1);
            }, function errorCallback(res) {
                //trigger error message here.
                console.log("Update Error");
                $rootScope.displayAlert('error',res.data.message);
            }
        )
    };
}]);