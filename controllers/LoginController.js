/**
 * Created by ahmedel-baz on 15-11-04.
 */

var bcrypt = require('bcrypt-nodejs');

var LoginController = function(app) {

    var Users = app.models.Users;
    var Tutors = app.models.Tutors;
    var Students = app.models.Students;
    var Profiles = app.models.Profiles;
    var parse = require('user-agent-parser');

//  Logs in the user
//  @bodyarg {String} email     The email credential.
//  @bodyarg {String} pass      The password credential.
//  @returns {Response} The user that logged in.
    this.login = function (req,res,next) {
        var email = req.body.email;
        var pass = req.body.pass;
        if(typeof email === "undefined") {
            var errMsg = "Error: Email not sent.";
            console.log(errMsg);
            res.status(400).send({error:true,message:errMsg});
        } else if(typeof pass === "undefined") {
            var errMsg = "Error: Password not sent.";
            console.log(errMsg);
            res.status(400).send({error:true,message:errMsg});
        } else{
            Users.findOne({email:email}, function(err, user) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error:true,message:"An internal server error occurred."});
                }
                if (user) {

                    var now = new Date();
                    if ((now.getTime() - user.lastFailedLogin.getTime()) < 10000 || !user.validPassword(pass)){

                        user.lastFailedLogin = new Date();
                        user.save(function (err) {
                            if (err) {
                                console.log(err.message);
                                res.status(500).send({error: true, message: "An internal server error occurred."});
                                return;
                            }
                            var errMsg = "Error: Invalid email or password. Try Again in 10 seconds";
                            res.status(400).send({error: true, message: errMsg});
                        });
                    } else {
                        req.session.userId = user._doc._id;
                        console.log("User " + user.email + " Successfully logged in");
                        res.send({error: false, data: user});
                        next();
                    }
                } else {
                    var errMsg = "Error: Invalid email or password.";
                    console.log(errMsg);
                    res.status(400).send({error: true, message: errMsg});

                }
            });
        }
    };

    this.logout = function (req,res,next) {
        delete req.session.userId;
        res.send({error: false});
    };

//  Registers the user.
//  @bodyarg {String} email         The email to register with.
//  @bodyarg {String} pass          The password to register with.
//  @bodyarg {String} confirmPass   The password confirmation. This must be the same as the password.
//  @bodyarg {String} kind          The kind of user to register as.
//  @returns {String} The registered user.
    this.register = function (req,res,next) {
        var email = req.body.email;
        var pass = req.body.pass;
        var confirmPass = req.body.confirmPass;
        var userType = req.body.userType;
        if(typeof email === "undefined") {
            var errMsg = "Error: Email not sent.";
            console.log(errMsg);
            res.status(400).send({error:true,message:errMsg});
        } else if(userType !='Tutor' && userType !='Student' && userType !='Other' ) {
            var errMsg = "Error: User Type can only be: 'Tutor','Student',or 'Other'.";
            console.log(errMsg);
            res.status(400).send({error:true,message:errMsg});
        } else if(typeof pass === "undefined" || typeof confirmPass === "undefined") {
            var errMsg = "Error: Password or Password Confirmation not sent.";
            console.log(errMsg);
            res.status(400).send({error:true,message:errMsg});
        } else if(pass != confirmPass) {
            var errMsg = "Error: Password and Password Confirmation do not match.";
            console.log(errMsg);
            res.status(400).send({error:true,message:errMsg});
        } else {
            Users.find({email:email}, function(err, users){
                if(err){
                    console.log(err.message);
                    res.status(500).send({error:true,message:"An internal server error occurred."});
                }
                if(!users.length){
                    Users.count({}, function(err,count){
                        if(err){
                            console.log(err.message);
                            res.status(500).send({error:true,message:"An internal server error occurred."});
                        }
                        var authorization = (count==0)?"SAdmin":"User";
                        Profiles.create({
                            description: ""
                        },function(err,profile){
                            if(err){
                                console.log(err.message);
                                res.status(500).send({error:true,message:"An internal server error occurred."});
                            }

                            // Create based on the kind of User.
                            var Database = Users;
                            var attributes = {
                                email: email,
                                displayName: email,
                                password: bcrypt.hashSync(pass, bcrypt.genSaltSync(8), null),
                                authorization: authorization,
                                profile: profile._id
                            };
                            if (userType == 'Tutor') {
                                Database = Tutors;
                                attributes.charge = 0.00;
                            } else if (userType == 'Student') {
                                Database = Students;
                            }

                            Database.create(attributes, function(err,user) {
                                if(err){
                                    console.log(err.message);
                                    res.status(500).send({error:true,message:"An internal server error occurred."});
                                }
                                req.session.userId = user._doc._id;
                                delete user._doc.password;
                                delete user._doc.__v;
                                res.send({error: false, data: user});
                                next();
                            });
                        });
                    });
                } else {
                    var errMsg = "Error: User with given email already exists.";
                    console.log(errMsg);
                    res.status(400).send({error:true,message:errMsg});
                }
            });
        }
    };

    this.handleStudentRedirect = function(req,res,next) {
        if(typeof req.query.code === 'undefined') {
            var errMsg = "Error: Authorization code was not provided!"
            res.status(400).send({error: true, message:errMsg});
        }
        else
        {
            var code = req.query.code;
            var plus = app.google.plus('v1');

            var oauth2Client = new app.OAuth2(app.CLIENT_ID, app.CLIENT_SECRET, app.STUDENT_REDIRECT_URL);

            oauth2Client.getToken(code, function(err, tokens) {
                // Now tokens contains an access_token and an optional refresh_token. Save them.
                if(!err) {
                    oauth2Client.setCredentials(tokens);
                    plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
                        // handle err and response
                        // You have the profile now.
                        if(err) {
                            res.status(500).send({error: true, message: "An internal server error occurred."});
                        }
                        else {
                            //Find or save user.

                            Users.findOne({email:response.emails[0].value}, function(err, user) {
                                if (err) {
                                    console.log(err.message);
                                    res.status(500).send({error:true,message:"An internal server error occurred."});
                                }
                                if (user) {
                                        req.session.userId = user._doc._id;
                                        console.log("User " + user.email + " Successfully logged in");
                                        res.redirect('/#/');
                                }
                                else {
                                    // Registering google user
                                    Users.count({}, function(err,count){
                                        if(err){
                                            console.log(err.message);
                                            res.status(500).send({error:true,message:"An internal server error occurred."});
                                        }
                                        var authorization = (count==0)?"SAdmin":"User";
                                        Profiles.create({
                                            description: ""
                                        },function(err,profile){
                                            if(err){
                                                console.log(err.message);
                                                res.status(500).send({error:true,message:"An internal server error occurred."});
                                            }

                                            // Create based on the kind of User.
                                            var Database = Users;
                                            var attributes = {
                                                email: response.emails[0].value,
                                                displayName: response.displayName,
                                                password: bcrypt.hashSync("", bcrypt.genSaltSync(8), null),
                                                authorization: authorization,
                                                profile: profile._id
                                            };
                                            Database = Students;
                                            Database.create(attributes, function(err,user) {
                                                if(err){
                                                    console.log(err.message);
                                                    res.status(500).send({error:true,message:"An internal server error occurred."});
                                                }
                                                req.session.userId = user._doc._id;
                                                delete user._doc.password;
                                                delete user._doc.__v;
                                                res.redirect('/#/');
                                            });
                                        });
                                    });

                                }
                            });


                        }
                    });
                }
            });
        }
    };

    this.handleTutorRedirect = function(req,res,next) {
        if(typeof req.query.code === 'undefined') {
            var errMsg = "Error: Authorization code was not provided!"
            res.status(400).send({error: true, message:errMsg});
        }
        else
        {
            var code = req.query.code;
            var plus = app.google.plus('v1');

            var oauth2Client = new app.OAuth2(app.CLIENT_ID, app.CLIENT_SECRET, app.TUTOR_REDIRECT_URL);

            oauth2Client.getToken(code, function(err, tokens) {
                // Now tokens contains an access_token and an optional refresh_token. Save them.
                if(!err) {
                    oauth2Client.setCredentials(tokens);
                    plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
                        // handle err and response
                        // You have the profile now.
                        if(err) {
                            res.status(500).send({error: true, message: "An internal server error occurred."});
                        }
                        else {
                            //Find or save user.

                            Users.findOne({email:response.emails[0].value}, function(err, user) {
                                if (err) {
                                    console.log(err.message);
                                    res.status(500).send({error:true,message:"An internal server error occurred."});
                                }
                                if (user) {
                                    req.session.userId = user._doc._id;
                                    console.log("User " + user.email + " Successfully logged in");
                                    res.redirect('/#/');
                                }
                                else {
                                    // Registering google user
                                    Users.count({}, function(err,count){
                                        if(err){
                                            console.log(err.message);
                                            res.status(500).send({error:true,message:"An internal server error occurred."});
                                        }
                                        var authorization = (count==0)?"SAdmin":"User";
                                        Profiles.create({
                                            description: ""
                                        },function(err,profile){
                                            if(err){
                                                console.log(err.message);
                                                res.status(500).send({error:true,message:"An internal server error occurred."});
                                            }

                                            // Create based on the kind of User.
                                            var Database = Users;
                                            var attributes = {
                                                email: response.emails[0].value,
                                                displayName: response.displayName,
                                                password: bcrypt.hashSync("xxx", bcrypt.genSaltSync(8), null),
                                                authorization: authorization,
                                                profile: profile._id
                                            };
                                            Database = Tutors;
                                            attributes.charge = 0.00;
                                            Database.create(attributes, function(err,user) {
                                                if(err){
                                                    console.log(err.message);
                                                    res.status(500).send({error:true,message:"An internal server error occurred."});
                                                }
                                                req.session.userId = user._doc._id;
                                                delete user._doc.password;
                                                delete user._doc.__v;
                                                res.redirect('/#/');
                                            });
                                        });
                                    });

                                }
                            });


                        }
                    });
                }
            });
        }
    };

    this.googleStudentLogin = function(req,res,next) {
        res.redirect(app.studentAuthUrl);
    }

    this.googleTutorLogin = function(req,res,next) {
        res.redirect(app.tutorAuthUrl);
    }

};

module.exports = LoginController;