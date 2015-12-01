angular.module('MyApp.dashboard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/dash', {
            templateUrl: 'js/app/dashboard/dashboard.html',
            controller: 'DashController'
        });
}])
.controller("DashController", ['$scope','$http','$rootScope', function($scope, $http, $rootScope,$routeParams) {

    // To Do --> correcting attibutes from data 
    //       --> LIVE testing
    //       --> add link to tutor profile form student dash. 

	$scope.searchTerm = "";

	$scope.noResponseClass = 'bg-info';
	$scope.acceptResponseClass = 'bg-success';
	$scope.denyResponseClass = 'bg-danger'

    $scope.panelClick = function (panel){
        panel.active = !panel.active;
    };

    $scope.searchTopic =  function (){
        ///api/tutors/:tutorId/reviews/:reviewId
        $http.get('/api/getTutors/topic/' + $scope.searchTerm.trim()).then(
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
        req.hasResponse = true;
        req.accepted = true;
        // Check if already has responses
        if (!req.hasResponse){
            $http.put('/api/' + $rootScope.actor._id + '/requests/' + req._id
                ,{response: req.response, message: req.resMessage}).then(                   
                function successCallback(res){
                        req.hasResponse = true;
                    });
        }
    };
 

    // TEST DATA
    //$scope.userType = 'Tutor';
    //$scope.requests = [{studentName: "Arthur", hasResponse: true, rating: 4, review: "THIS GUY SUCKS", message: "This guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad reviewThis guy made a bad review", active: false}, {n: 2, active: false},{n: 3, active: false},{n: 4, active: false}];


	$http.get('/api/actor').then(
        function successCallback(res){
            $rootScope.actor = res.data.data;
            // If actor is student default response is to send reconmmended Tutors
            if ($rootScope.actor.userType == 'Student'){
            	$http.get('/api/students/' + $rootScope.actor._id + '/getRecommendedTutors/').then(
            		function successCallback(res){
            			$scope.tutors = res.data.data;
            			$scope.userType = 'Student';
            		});

            // If actor is tutor get all requests and add attributes 
            // for display.
            } else if ($rootScope.actor.userType == 'Tutor') {
            	$http.get('/api/tutors/'+ $rootScope.actor._id + '/requests').then(
            		function successCallback(res){
            			$scope.requests = res.data.data;

                        $scope.requests.forEach(function(req){
                            req.active = false;
                            req.response = false;
                            req.resMessage = "";
                        });
            			$scope.userType = 'Tutor';
            		});
            } else if ($rootScope.actor.userType == 'Tutor'){
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