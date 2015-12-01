/**
 * Created by ahmedel-baz on 15-11-04.
 */
var SecurityGate = function(app) {

    var Users = app.models.Users;

//  Checks if the signed in user is an administrator.
    this.checkIfUserIsAdmin = function (req,res,next) {
        var userId = req.session.userId;
        if(typeof userId === "undefined") {
            console.log("No user signed in");
            res.status(401).send({error:true,message:"User is not signed in."})
        } else {
            Users.findById(userId, function (err, user) {
                if (err) {
                    console.log("ERROR:" + err);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                if (user.authorization == "Admin" || user.authorization == "SAdmin") {
                    next();
                } else {
                    res.status(401).send({error: true, message: "User does not have required privileges."})
                }
            });
        }
    };

//  Checks if the signed in user is the same as the target user or is an administrator.
    this.checkIfUserIsAdminOrSelf = function (req,res,next) {
        var userId = req.session.userId;
        var targetUserId = req.params.userId;
        if(typeof userId === "undefined") {
            console.log("No user signed in");
            res.status(401).send({error:true,message:"User is not signed in."})
        } else {
            Users.findById(userId, function (err, user) {
                if (err) {
                    console.log("ERROR:" + err);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                if (user.authorization == "Admin" || user.authorization == "SAdmin") {
                    next();
                } else if (userId == targetUserId) {
                    next();
                }
                else {
                    res.status(401).send({error: true, message: "User does not have required privileges."})
                }
            });
        }
    };

//  Checks if the target user has a lower authorization level than the signed in user, or if the user's acting on himself.
    this.checkIfActingOnLowerAuthorization = function (req,res,next) {
        var userId = req.session.userId;
        var targetUserId = req.params.userId;
        if(typeof userId === "undefined") {
            console.log("No user signed in");
            res.status(401).send({error:true,message:"User is not signed in."})
        } else {
            Users.findById(userId, function (err, user) {
                if (err) {
                    console.log("ERROR:" + err);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                Users.findById(targetUserId, function (err, targetUser) {
                    if (err) {
                        console.log("ERROR:" + err);
                        res.status(500).send({error: true, message: "An internal server error occurred."});
                    }
                    if (user.authorization == "SAdmin" && (targetUser.authorization == "Admin" || targetUser.authorization == "User")) {
                        next();
                    } else if (user.authorization == "Admin" && targetUser.authorization == "User") {
                        next();
                    }else if (userId == targetUserId) {
                        next();
                    }
                    else {
                        res.status(401).send({error: true, message: "User does not have required privileges."})
                    }
                });
            });
        }
    };

//  Checks if the user is a super administrator.
    this.checkIfUserIsSAdmin = function (req,res,next) {
        var userId = req.session.userId;
        if(typeof userId === "undefined") {
            console.log("No user signed in");
            res.status(401).send({error:true,message:"User is not signed in."})
        } else {
            Users.findById(userId, function (err, user) {
                if (err) {
                    console.log("ERROR:" + err);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                if (user.authorization == "SAdmin") {
                    next();
                } else {
                    res.status(401).send({error: true, message: "User does not have required privileges."})
                }
            });
        }
    };

//  Checks if the user is signed in.
    this.checkIfUserIsSignedIn = function (req,res,next) {
        var userId = req.session.userId;
        if(typeof userId === "undefined") {
            console.log("No user signed in");
            res.status(401).send({error:true,message:"User is not signed in."});
        } else {
            Users.findById(userId, function (err, user) {
                if (err) {
                    console.log("ERROR:" + err);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                } else {
                    // TODO we want to see if target ID is param ID, no?
                    next();
                }
            });
        }
    };

//  Checks if there is no user signed in.
    this.checkIfAnonymous = function (req,res,next) {
        var userId = req.session.userId;
        if(typeof userId === "undefined") {
            console.log("Anonymous test passed: No user signed in");
            next();
        } else {
            res.status(401).send({error:true,message:"There is another user already signed in."});
        }
    };

    function checkIfUserIsTutorOrStudent (req, res, next, userType) {
        var userId = req.session.userId;
        if(typeof userId === "undefined") {
            console.log("No user signed in");
            res.status(401).send({error:true,message:"User is not signed in."});
        } else {
            Users.findById(userId, function (err, user) {
                if (err) {
                    console.log("ERROR:" + err);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                } else if (user.userType === userType) {
                    next();
                } else {
                    console.log("User missing appropriate tutor or student privileges.");
                    res.status(401).send({error: true, message: "User missing appropriate tutor or student privileges."});
                }
            });
        }
    }

//  Checks if the user is a signed in tutor.
    this.checkIfUserIsTutor = function (req,res,next) {
        checkIfUserIsTutorOrStudent(req, res, next, 'Tutors');
    };

//  Checks if the user is a signed in student.
    this.checkIfUserIsStudent = function (req,res,next) {
        checkIfUserIsTutorOrStudent(req, res, next, 'Students');
    };

//  Checks if the user is a signed in tutor or signed in admin.
    this.checkIfUserIsTutorOrAdmin = function (req,res,next) {
        var userId = req.session.userId;
        if(typeof userId === "undefined") {
            console.log("No user signed in");
            res.status(401).send({error:true,message:"User is not signed in."});
        } else {
            Users.findById(userId, function (err, user) {
                if (err) {
                    console.log("ERROR:" + err);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                } else if (user.userType === "Tutors" || user.authorization == "Admin" || user.authorization == "SAdmin") {
                    next();
                } else {
                    var errMsg = "User missing appropriate tutor or admin privileges.";
                    console.log(errMsg);
                    res.status(401).send({error: true, message: errMsg});
                }
            });
        }
    };
};

module.exports = SecurityGate;