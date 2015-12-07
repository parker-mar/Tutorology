angular.module('MyApp.dashboard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/dashboard', {
            templateUrl: 'js/app/dashboard/dashboard.html',
            controller: 'DashController'
        });
}])
.controller("DashController", ['$scope','$http','$rootScope', '$filter', function($scope, $http, $rootScope, $filter) {

	$scope.noResponseClass = 'bg-info';
	$scope.acceptResponseClass = 'bg-success';
	$scope.denyResponseClass = 'bg-danger';
    $scope.noRating = "Not Yet Rated";
    $scope.noDescription = "Description Not Yet Set";
    $scope.noTopic = "Topics Not Yet Set";
    $scope.noDisplayName = "Display Name Not Yet Set";

    $scope.panelClick = function (panel){
        panel.active = !panel.active;
    };

    $scope.searchTopic =  function (searchTerm ){
        ///api/tutors/:tutorId/reviews/:reviewId
        $http.post('/api/get-tutors', {topicName: searchTerm}).then(
            function successCallback(res){
                    $scope.tutors = res.data.data;
                    $scope.tutors.forEach(function(tutor){
                        tutor.topicStr = "";
                        tutor.topics.forEach(function(topic){
                            tutor.topicStr += (topic.name + ", ");
                        })
                    });
                });
    };

    $scope.disputeIgnore = function (dispute){
        $http.put('/api/tutors/'+ $rootScope.actor._id +'/reviews/'+ dispute._id, {flagged: false}).then(
            function successCallback(){
                    $scope.disputes.splice($scope.disputes.indexOf(dispute), 1);
                });
    };

    $scope.disputeRemove = function (dispute){
        $http.delete('/api/tutors/'+ $rootScope.actor._id +'/reviews/'+ dispute._id).then(
            function successCallback(res){
                    $scope.disputes.splice($scope.disputes.indexOf(dispute), 1);
                });
    };

    $scope.studentRequests = function () {  
        window.location.href = '/#/requests';
    };

    $scope.studentReferrals = function () {
        window.location.href = '/#/referrals';
    };

    $scope.goToSearch =  function (){
        window.location.href = '/#/search'
    };

    $scope.adminPanel = function (){
        window.location.href = '/#/admin'
    };

    // send a response for request.
    $scope.sendRequest =  function (req, accpt, message){
        // Check if already has responses
        if (!req.hasResponse){
            $http.put('/api/tutors/' + $rootScope.actor._id + '/requests/' + req._id
                ,{accepted: accpt, response: message}).then(              
                function successCallback(res){
                        req.hasResponse = true;
                        req.accepted = accpt;
                    },

                    function errorCallback(res){
                        //trigger error message here.
                        console.log("Error Searching for Tutors By Topic");
                        $rootScope.displayAlert('error',res.data.message);
                    });
        }
    };
 
	$http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;
            // If actor is student default response is to send reconmmended Tutors
            if ($rootScope.actor.authorization == 'SAdmin' || $rootScope.actor.authorization == 'Admin'){
                $http.get('/api/get-disputes/').then(
                    function successCallback(res){
                        $scope.disputes = res.data.data;
                        $scope.disputes.forEach(function(dispute){
                            dispute.active = false;
                        });
                        $scope.userType = 'Admins';
                    },   function errorCallback(res){
                                //trigger error message here.
                                console.log("Failed Getting the Disputes");
                                $rootScope.displayAlert('error',res.data.message);
                            });
            
            } else if ($rootScope.actor.userType == 'Students'){
            	$http.get('/api/students/' + $rootScope.actor._id + '/recommendations').then(
            		function successCallback(res){
            			$scope.tutors = res.data.data;
                        $scope.tutors.forEach(function(tutor){
                            tutor.topicStr = "";
                            tutor.topics.forEach(function(topic){
                                tutor.topicStr += (topic.name + ", ");
                            })
                        });
            			$scope.userType = 'Students';
            		},
                            function errorCallback(res){
                                //trigger error message here.
                                console.log("Update Error");
                                $rootScope.displayAlert('error',res.data.message);
                            });

            // If actor is tutor get all requests and add attributes 
            // for display.
            } else if ($rootScope.actor.userType == 'Tutors') {
            	$http.get('/api/tutors/'+ $rootScope.actor._id + '/requests').then(
            		function successCallback(res){
            			$scope.requests = res.data.data;

                        console.log($scope.requests);
                        $scope.requests.forEach(function(req){
                            req.active = false;
                            req.created_at = $filter('date')(req.created_at, 'medium');
                        });
            			$scope.userType = 'Tutors';
    		          },   function errorCallback(res){
                        //trigger error message here.
                        console.log("Error getting Tutors.");
                        $rootScope.displayAlert('error',res.data.message);
                    });
            }  
        },

        function errorCallback(res){
            //trigger error message here.
            console.log("Error getting Actor");
            window.location.href = '/#/login';
        });


}]);