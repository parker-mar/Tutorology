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
    $scope.newReview = {};
    $scope.newReferral ={};
    // Redirects to the landing page if user is not logged in.
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
                                console.log("Get topics Error");
                                $rootScope.displayAlert('error',res.data.message);
                            }
                        );
                    }
                    if($scope.user.userType == "Tutors") {
                        $http.get('/api/tutors/'+$routeParams.userId+"/reviews").then(
                            function successCallback(res){
                                $scope.user.reviews = res.data.data;
                                console.log($scope.user.reviews);
                                for(var key in  $scope.user.reviews){
                                    (function(review) {
                                        review.ratingWidth =  25*review.rating;
                                        review.showReportingFields = (review.flagged)?false:true;
                                        review.time = Date.parse(review.created_at);
                                        review.time_formatted = $filter('date')(review.time, 'medium');
                                            $http.get('/api/users/' + review.studentId._id).then(
                                                function successCallback(res) {
                                                    review.student = res.data.data;
                                                },
                                                function errorCallback(res) {
                                                    //trigger error message here.
                                                    console.log("Get Student from review Error");
                                                    $rootScope.displayAlert('error', res.data.message);
                                                }
                                            )
                                    })($scope.user.reviews[key]);
                                }
                            },
                            function errorCallback(res){
                                //trigger error message here.
                                console.log("Update Error");
                                $rootScope.displayAlert('error',res.data.message);
                            }
                        );
                    }
                    $scope.user.activities.forEach(function(activity){
                        activity.time = Date.parse(activity.created_at);
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
        // Adds a review to the user when called.
    $scope.addReview = function () {
        $scope.newReview.tutorId = $scope.user._id;
        $(".error").hide();
        if($scope.newReview.message.length > 500) {
            $rootScope.displayAlert("error", "Error: Description text exceeds maximum length of 500.");
        } else if($scope.newReview.rating < 0 ||$scope.newReview.rating > 5 || isNaN($scope.newReview.rating)){
            $rootScope.displayAlert("error","Error: Rating must be between 0 and 5.");
        } else {
            $http.post('/api/students/' + $rootScope.actor._id + "/reviews", $scope.newReview).then(
                function successCallback(res) {
                    //trigger error message here.
                    console.log("Add Review Successful");
                    $rootScope.displayAlert('success', 'Review addition successful!');
                    $scope.newReview = {};
                    location.reload();
                    if (typeof $scope.user.reviews !== 'undefined')
                        $scope.user.reviews.push(res.data.data);
                }, function errorCallback(res) {
                    //trigger error message here.
                    console.log("Update Error");
                    $rootScope.displayAlert('error', res.data.message);
                    $scope.newReview = {};
                }
            )
        }
    };
    // Navigates to profile editing page when called.
    $scope.editUser = function () {
        // window.location.href = '/#/users/'+ $routeParams.userId +'/profile/edit';
        go('/#/users/'+ $routeParams.userId +'/profile/edit');
    };



    // Promotes the user to "Admin" authorization level when called.
    $scope.makeUserAdmin = function () {
        $scope.user.authorization = "Admin";
        $http.put('/api/users/'+$scope.user._id+'/setadmin',$scope.user).then(
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
        $http.put('/api/users/'+$scope.user._id+'/setadmin',$scope.user).then(
            function successCallback(res) {
                $rootScope.displayAlert('success','User has been demoted.');
            },
            function errorCallback(res) {
                //trigger error message here.
                $rootScope.displayAlert('error',res.data.message);
            }
        );
    };
    $scope.referencing = function(){
        $scope.newReferral.tutorId = $scope.user._id;
        $(".error").hide();
        if($scope.newReferral.message.length > 500) {
            $rootScope.displayAlert("error", "Error: Description text exceeds maximum length of 500.");
        } else if(!($scope.newReferral.toStudentEmail)){
            $rootScope.displayAlert("error","Error: 'Refer to' field can't be empty.");
        } else {
            $http.post('/api/students/' + $rootScope.actor._id + "/referrals", $scope.newReferral).then(
                function successCallback(res) {
                    //trigger error message here.
                    console.log("Add Referral Successful");
                    $rootScope.displayAlert('success', 'Referral addition successful!');
                    $scope.newReferral = {};
                }, function errorCallback(res) {
                    //trigger error message here.
                    console.log("Refer Error");
                    $rootScope.displayAlert('error', res.data.message);
                    $scope.newReferral = {};
                }
            )
        }
    };
//put(root+'tutors/:tutorId/reviews/:reviewId',
//  Sets the review flag
//  @paramarg {String} tutorId       The ID of the tutor flagging the review.
//  @paramarg {String} reviewId      The ID of the review.
//  @bodyarg {Boolean} flagged       The flag.
//  @bodyarg {String} reason         The reason for flagging (optional).
//  @returns {Response}              The result of of the update operation.
    $scope.updateReviewFlag = function(review){
        $scope.temp = {};
        $scope.temp.flagged = review.flagged;
        $scope.temp.reason = review.reason;
        $http.put('/api/tutors/'+$scope.actor._id+'/reviews/'+review._id,$scope.temp).then(
            function successCallback(res) {
                $rootScope.displayAlert('success','Review Flagged, Admin will check it as soon as possible.');
                $scope.temp = {};
                review.showReportingFields = false;
            },
            function errorCallback(res) {
                //trigger error message here.
                $rootScope.displayAlert('error',res.data.message);
            }
        );
    };
    $scope.goToRequest = function(){
        go('/#/request/'+ $routeParams.userId);
    }
}]);