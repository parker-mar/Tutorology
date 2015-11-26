/**
 * Created by ahmedel-baz on 15-11-04.
 */
var AnalyticsController = function(app) {

    var Users = app.models.Users;
    var Connections = app.models.Connections;
    var Activities = app.models.Activities;

    var parse = require('user-agent-parser');


//  Logs the user's connection information on login, through the 'user-agent' header.
    this.recordUserConnectionInfo = function (req,res,next) {
        var userAgentString = req.headers['user-agent'];
        var parsedUserAgent = parse(userAgentString);
        var browser = parsedUserAgent.browser.name;
        var device = parsedUserAgent.device;
        var os = parsedUserAgent.os.name;
        var email = req.body.email;
        var ipAddress = req.connection.remoteAddress.split(':');
        ipAddress = ipAddress[ipAddress.length-1];
        Users.findOne({email:email}, function(err, user) {
            if (err) {
                console.log(err.message);
            } else if (user) {
                var userId = user._doc._id;
                if(typeof device !== 'undefined') {
                    Connections.findOne({user: userId,browser: browser,ipAddress: ipAddress,os: os}, function (err, con) {
                        if (err) {
                            console.log(err.message);
                        } else if (!con) {
                            Connections.create({
                                user: userId,
                                ipAddress: ipAddress,
                                device: {
                                    dtype: device.type,
                                    vendor: device.vendor,
                                    model: device.model
                                },
                                browser: browser,
                                os: os
                            }, function (err, conn) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    user.connections.push(conn);
                                    user.save(function (err) {
                                        if (err) {
                                            console.log(err.message);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    Connections.findOne({user:userId,browser:browser,ipAddress:ipAddress,os:os}, function(err, con) {
                        if(err) {
                            console.log(err.message);
                        } else if(!con) {
                            Connections.create({
                                user:userId,
                                ipAddress:ipAddress,
                                browser:browser,
                                os: os
                            },function(err,conn) {
                                if(err) {
                                    console.log(err.message);
                                } else {
                                    user.connections.push(conn);
                                    user.save(function(err){
                                        if(err) {
                                            console.log(err.message);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    };

//  Gets all the activities in the database.
//  @returns {Response} All the activities in the database.
    this.getAllActivities = function (req, res, next) {
        Activities.find({})
            .exec(function (err, activities) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                res.send({error: false, data: activities});
            });

    };

//  Gets all the connections in the database.
//  @returns {Response} All the connections in the database.
    this.getAllConnections = function (req, res, next) {
        Connections.find({})
            .exec(function (err, connections) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                res.send({error: false, data: connections});
            });

    };

};

module.exports = AnalyticsController;