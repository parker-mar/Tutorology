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
    app.post(root+'login',securityGate.checkIfAnonymous,loginController.login, analyticsController.recordUserConnectionInfo);

    app.post(root+'logout',securityGate.checkIfUserIsSignedIn,loginController.logout);

    app.post(root+'register',securityGate.checkIfAnonymous,loginController.register, analyticsController.recordUserConnectionInfo);

    // User Routes
    app.get(root+'users',securityGate.checkIfUserIsSignedIn,userController.getAllUsers);

    app.post(root+'users/:userId',securityGate.checkIfActingOnLowerAuthorization,userController.updateUser);

    app.post(root+'users/:userId/changepass',securityGate.checkIfUserIsSignedIn,userController.changePass);

    app.get(root+'users/:userId',securityGate.checkIfUserIsSignedIn,userController.getUser);

    app.get(root+'actor',securityGate.checkIfUserIsSignedIn,userController.getActor);

    app.post(root+'users/:userId/setadmin',securityGate.checkIfUserIsSAdmin,userController.setAuthorization);

    app.delete(root+'users/:userId',securityGate.checkIfActingOnLowerAuthorization,userController.deleteUser);

    app.get(root+'activities',securityGate.checkIfUserIsAdmin,analyticsController.getAllActivities);

    app.get(root+'connections',securityGate.checkIfUserIsAdmin,analyticsController.getAllConnections);

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