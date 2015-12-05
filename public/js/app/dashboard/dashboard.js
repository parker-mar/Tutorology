angular.module('MyApp.dashboard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/dash', {
            templateUrl: 'js/app/dashboard/dashboard.html',
            controller: 'DashController'
        });
}])
.controller("DashController", ['$scope','$http','$rootScope', function($scope, $http, $rootScope) {

    // To Do --> correcting attibutes from data 
    //       --> LIVE testing
    //       --> add link to tutor profile form student dash. 

	$scope.searchTerm = "";

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

    $scope.searchTopic =  function (){
        ///api/tutors/:tutorId/reviews/:reviewId
        $http.post('/api/get-tutors', {topicName: $scope.searchTerm}).then(
            function successCallback(res){
                    $scope.tutors = res.data.data;
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

    $scope.adminAnalytics = function (){
        window.location.href = '/#/analytics'
    };

    // send a response for request.
    $scope.sendRequest =  function (req){
        // Check if already has responses
        if (!req.hasResponse){
            $http.put('/api/' + $rootScope.actor._id + '/requests/' + req._id
                ,{accepted: req.response, response: req.resMessage}).then(                   
                function successCallback(res){
                        req.hasResponse = true;
                        req.accepted = req.response;
                    });
        }
    };
 
	$http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;
            // If actor is student default response is to send reconmmended Tutors
            if ($rootScope.actor.userType == 'Students'){
            	$http.get('/api/students/' + $rootScope.actor._id + '/recommendations').then(
            		function successCallback(res){
            			$scope.tutors = res.data.data;
                        console.log($scope.tutors);
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


                        $scope.requests.forEach(function(req){
                            req.active = false;
                        });
            			$scope.userType = 'Tutors';
            		});
            } else if ($rootScope.actor.userType == 'Tutors'){
                $http.get('/api/admin/get-disputes/').then(
                    function successCallback(res){
                        $scope.disputes = res.data.data;
                        $scope.disputes.forEach(function(dispute){
                            dispute.active = false;
                        });
                    });
            }
        });


}]);