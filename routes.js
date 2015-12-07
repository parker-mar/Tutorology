var express = require('express');

/**
 * Created by ahmedel-baz on 15-11-04.
 */
module.exports = function(app) {

    //Importing app resources
    var LoginController = require("./controllers/LoginController");
    var loginController = new LoginController(app);

    var UserController = require("./controllers/UserController");
    var userController = new UserController(app);

    var TutorController = require("./controllers/TutorController");
    var tutorController = new TutorController(app);

    var StudentController = require("./controllers/StudentController");
    var studentController = new StudentController(app);

    var AnalyticsController = require("./controllers/AnalyticsController");
    var analyticsController = new AnalyticsController(app);

    var SecurityGate = require("./controllers/SecurityGate");
    var securityGate = new SecurityGate(app);

    var root = "/api/";

    app.all('*',function (request, response, next) {
        // Print the name of the file for which request is made.
        console.log("Request for " + request.url + " received.");
        next();
    });

    // Login Routes
    app.post(root+'register',
        securityGate.checkIfAnonymous, loginController.register, analyticsController.recordUserConnectionInfo);

    app.post(root+'login',
        securityGate.checkIfAnonymous, loginController.login, analyticsController.recordUserConnectionInfo);

    app.post(root+'logout',
        securityGate.checkIfUserIsSignedIn, loginController.logout);


    app.get(root+'login/student/google',
        loginController.googleStudentLogin);

    app.get(root+'login/tutor/google',
        loginController.googleTutorLogin);

    app.get(root+'auth/student',
        loginController.handleStudentRedirect);
    app.get(root+'auth/tutor',
        loginController.handleTutorRedirect);

    // User Routes
    app.get(root+'users',
        securityGate.checkIfUserIsSignedIn, userController.getAllUsers);

    app.get(root+'users/:userId',
        securityGate.checkIfUserIsSignedIn, userController.getUser);

    app.put(root+'users/:userId',
        securityGate.checkIfActingOnLowerAuthorization, userController.updateUser);

    app.delete(root+'users/:userId',
        securityGate.checkIfActingOnLowerAuthorization,userController.deleteUser);

    app.put(root+'users/:userId/changepass',
        securityGate.checkIfUserIsSignedIn, userController.changePass);

    app.put(root+'users/:userId/setadmin',
        securityGate.checkIfUserIsSAdmin,userController.setAuthorization);

    // Tutor Routes
    app.post(root+'get-tutors',
        securityGate.checkIfUserIsSignedIn, tutorController.getTutors);

    app.get(root+'tutors/:tutorId',
        securityGate.checkIfUserIsSignedIn, tutorController.getTutor);

    app.post(root+'tutors/:tutorId/topics',
        securityGate.checkIfUserIsTutor, tutorController.addTopic);

    app.get(root+'tutors/:tutorId/topics',
        securityGate.checkIfUserIsSignedIn, tutorController.getTopics);

    app.delete(root+'tutors/:tutorId/topics/:topicId',
        securityGate.checkIfUserIsTutor, tutorController.removeTopic);

    app.get(root+'tutors/:tutorId/requests',
        securityGate.checkIfUserIsSignedIn, tutorController.getRequests);

    app.put(root+'tutors/:tutorId/requests/:requestId',
        securityGate.checkIfUserIsTutor, tutorController.respondToRequest);

    app.get(root+'tutors/:tutorId/reviews',
        securityGate.checkIfUserIsSignedIn, tutorController.getReviews);

    app.put(root+'tutors/:tutorId/reviews/:reviewId',
        securityGate.checkIfUserIsTutorOrAdmin, tutorController.setReviewFlag);

    app.delete(root+'tutors/:tutorId/reviews/:reviewId',
        securityGate.checkIfUserIsAdmin, tutorController.removeReview);

    app.get(root+'get-disputes', tutorController.getDisputes);
    // Student Routes
    app.get(root+'students',
        securityGate.checkIfUserIsSignedIn, studentController.getStudents);

    app.post(root+'students/:studentId/requests',
        securityGate.checkIfUserIsStudent, studentController.makeRequest);

    app.get(root+'students/:studentId/requests',
        securityGate.checkIfUserIsSignedIn, studentController.getRequests);

    app.post(root+'students/:studentId/reviews',
        securityGate.checkIfUserIsStudent, studentController.makeReview);

    app.post(root+'students/:studentId/referrals',
        securityGate.checkIfUserIsStudent, studentController.makeReferral);

    app.get(root+'students/:studentId/referrals',
        securityGate.checkIfUserIsSignedIn, studentController.getReferrals);

    app.put(root+'students/:studentId/referrals/:referralId',
        securityGate.checkIfUserIsSignedIn, studentController.markReferralRead);

    app.get(root+'students/:studentId/recommendations',
        securityGate.checkIfUserIsSignedIn, studentController.getRecommendations);


    // Other User Routes
    app.get(root+'actor',
        securityGate.checkIfUserIsSignedIn, userController.getActor);

    app.get(root+'activities',
        securityGate.checkIfUserIsAdmin, analyticsController.getAllActivities);

    app.get(root+'connections',
        securityGate.checkIfUserIsAdmin, analyticsController.getAllConnections);

    //Sets the paths for public files
    app.use(express.static(__dirname + '/public'));

    //Catch-all statement to handle undefined paths
    app.use(function (request, response) {// Could not load the file
        // HTTP Status: 404 : NOT FOUND
        // Content Type: text/plain
        response.writeHead(404, {'Content-Type': 'text/html'});
        // Send the response body
        response.end();
    });

};