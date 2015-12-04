/**
 * Created by parkeraldricmar on 15-11-30.
 */
var StudentController = function(app) {

    var Tutors = app.models.Tutors;
    var Students = app.models.Students;
    var Topics = app.models.Topics;
    var Requests = app.models.Requests;
    var Reviews = app.models.Reviews;
    var Referrals = app.models.Referrals;
    var activityLogger = app.activityLogger;

//  Gets all students.
//  @returns {Response} Students in the database.
    this.getStudents = function (req,res,next) {
        //res.status(500).send({error: true, message: "Feature not implemented"});
        Students.find({}, Students.defaultFilter).exec(function (err, students) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            res.send({error : false, data : students});
        });
    };

//  Adds a request to database from a student to a tutor.
//  @paramarg {String} studentId     The ID of the student making the request.
//  @bodyarg {String} tutorId        The ID of the tutor the topic is to be added to.
//  @bodyarg {String} topicName      The name of the topic.
//  @bodyarg {String} message        (Optional) A message from the student to the tutor.
//  @returns {Response}              The result of of the create operation.
    this.makeRequest = function (req,res,next) {
        //res.status(500).send({error: true, message: "Feature not implemented"});
        var studentId = req.params.studentId;
        var tutorId = req.body.tutorId;
        var topicName = req.body.topicName;
        var message = req.body.message;

        if (typeof tutorId === "undefined") {
            var errMsg = "Error: tutorId unspecified.";
            console.log(errMsg);
            console.log(tutorId);
            console.log(topicName);
            console.log(studentId);
            console.log(message);
            res.status(400).send({error: true, message: errMsg});
            return;
        }
        if (typeof topicName === "undefined") {
            var errMsg = "Error: topicName unspecified.";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }

        Topics.findOne({name: topicName}).exec(function (err, topic) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
            }

            if (topic === null) {
                var errMsg = "Error: No tutor teaches the topic with the given topicName.";
                console.log(errMsg);
                res.status(400).send({error: true, message: errMsg});
                return;
            }

            var attributes = {
                studentId : studentId,
                tutorId : tutorId,
                topicId : topic._id,
                message : (typeof message === "undefined" ? "" : message),
                hasResponse : false,
                accepted : false,
                response : ""
            };
            Requests.create(attributes, function(err, request) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                res.send({error: false, data: request});
            });
        });
    };

//  Gets requests made by a student.
//  @paramarg {String} studentId     The ID of the student.
//  @returns {Response}              All requests made by the student.
    this.getRequests = function (req,res,next) {
        //res.status(500).send({error: true, message: "Feature not implemented"});
        var studentId = req.params.studentId;

        Requests.find({studentId : studentId}).exec(function (err, requests) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error : true, message : "An internal server error occurred."});
                return;
            }

            if (requests == null) {
                var errMsg = "Error: Student has issued no requests.";
                console.log(errMsg);
                res.status(400).send({error: true, message: errMsg});
                return;
            }

            res.send({error : false, data : requests});
        });
    };

//  Adds a review to database from a student about a tutor.
//  @paramarg {String} studentId     The ID of the student making the review.
//  @bodyarg {String} tutorId        The ID of the tutor which the review is about.
//  @bodyarg {Number} rating         The rating given to the tutor.
//  @bodyarg {String} message        (Optional) A message from the student about the tutor.
//  @returns {Response}              The result of of the create operation.
    this.makeReview = function (req,res,next) {
        //res.status(500).send({error: true, message: "Feature not implemented"});
        var studentId = req.params.studentId;
        var tutorId = req.body.tutorId;
        var rating = req.body.rating;
        var message = req.body.message;

        if (typeof tutorId === "undefined") {
            var errMsg = "Error: tutorId unspecified";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }
        if (typeof rating === "undefined") {
            var errMsg = "Error: rating unspecified";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }

        var attributes = {
            studentId : studentId,
            tutorId : tutorId,
            rating : rating,
            message : (message === "undefined" ? "" : message),
            flagged : false,
            reason : ""
        };

        //Check if Student ID maps to Student
        //Check if Tutor ID maps to Tutor
        //Create Review
        //Add Review to Student
        //Add Review to Tutor
        Reviews.create(attributes, function (err, review) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            Tutors.findById(tutorId, function (err, tutor) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                Reviews.find({tutorId : tutorId}, function(err, reviews) {
                    if (err) {
                        console.log(err.message);
                        res.status(500).send({error: true, message: "An internal server error occurred."});
                        return;
                    }

                    var avg = 0;
                    for (i = 0; i < reviews.length; i++) {
                        avg += reviews[i].rating;
                    }

                    avg = avg / reviews.length;

                    tutor.rating = avg;

                    tutor.save(function (err) {
                        if (err) {
                            console.log(err.message);
                            res.status(500).send({error: true, message: "An internal server error occurred"});
                            return;
                        }

                        res.send({error: false, data: review});
                    });
                });
            });
        });
    };

//  Adds a referral to database from a student to another student.
//  @paramarg {String} fromStudentId    The ID of the student making the referral.
//  @bodyarg {String} toStudentEmail    The email of the student receiving the referral.
//  @bodyarg {String} tutorId           The ID of the tutor the referral is about.
//  @bodyarg {String} message           (Optional) A message from the student to the other student.
//  @returns {Response}                 The result of of the create operation.
    this.makeReferral = function (req,res,next) {
        //res.status(500).send({error: true, message: "Feature not implemented"});
        var fromStudentId = req.params.studentId;
        var toStudentEmail = req.body.toStudentEmail;
        var tutorId = req.body.tutorId;
        var message = req.body.message;

        if (typeof tutorId === "undefined") {
            var errMsg = "Error: tutorId unspecified";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }
        if (typeof toStudentEmail === "undefined") {
            var errMsg = "Error: toStudentEmail unspecified";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }

        Students.findOne({email: toStudentEmail}, function(err, student) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
            }

            if (!student) {
                var errMsg = "No student with given email.";
                console.log(errMsg);
                res.status(400).send({error: true, message: errMsg});
            }

            var attributes = {
                fromStudentId : fromStudentId,
                toStudentId : student._id,
                tutorId : tutorId,
                message : (message ? "" : message),
                isRead : false
            };

            Referrals.create(attributes, function(err, referral) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                res.send({error: false, data: referral});
            });
        });
    };

//  Get referrals given to a student.
//  @paramarg {String} studentId     The ID of the student receiving referrals.
//  @returns {Response}              The result of of the search.
    this.getReferrals = function (req,res,next) {
        //res.status(500).send({error: true, message: "Feature not implemented"});
        var studentId = req.params.studentId;

        Referrals.find({toStudentId : studentId}).populate('fromStudentId').populate('tutorId').exec(function (err, referrals) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error : true, message : "An internal server error occurred."});
                return;
            }

            if (referrals == null) {
                var errMsg = "Error: Student has received no referrals.";
                console.log(errMsg);
                res.status(400).send({error: true, message: errMsg});
                return;
            }

            res.send({error : false, data : referrals});
        });
    };

//  Mark a given referral as being read.
//  @paramarg {String} studentId     The ID of the student who has the referral.
//  @paramarg {String} referralId    The ID of the referral.
//  @bodyarg {Boolean} isRead        Whether the referral is read or not.
    this.markReferralRead = function (req,res,next) {
        //res.status(500).send({error: true, message: "Feature not implemented"});
        var studentId = req.params.studentId;
        var referralId = req.params.referralId;
        var isRead = (req.body.isRead == "true" ? true : false);
        console.log(isRead);
        console.log("loogged is read");

        if (typeof isRead === "undefined") {
            var errMsg = "Error: isRead unspecified";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }
        Referrals.findById(referralId, function(err, referral) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error : true, message : "An internal server error occurred."});
                return;
            }
            if (!referral) {
                var errMsg = "No such referral exists.";
                console.log(errMsg);
                res.status(400).send({error : true, message : errMsg});
                return;
            }

            referral.isRead = isRead;
            referral.save(function(err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error : true, message : "An internal server error occurred."});
                    return;
                }
                res.send({error: false, data: referral});
            });
        });
    };

//  Gets recommended tutors for the student. This is done by getting
//  up to three tutors related to the last topic the student made a request for.
//  @paramarg {String} studentId     The ID of the student who has the referral.
//  @returns {Response}              An array of recommended tutors.
    this.getRecommendations = function (req,res,next) {
        //res.status(500).send({error: true, message: "Feature not implemented"});
        var studentId = req.params.studentId;

        // find requests made by the student and sort from newest to oldest
        Requests.find({studentId : studentId}).sort({created_at : 'desc'}).exec(function (err, request) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            // if the student has made requests before
            if (request.length > 0) {
                // find tutors who teach the topic of the request
                // sorted by highest to lowest rating
                Tutors.find({topics : request[0].topicId}).sort({rating : 'desc'}).exec(function (err, tutor) {
                    if (err) {
                        console.log(err.message);
                        res.status(500).send({error: true, message: "An internal server error occurred."});
                        return;
                    }

                    validTutors = [];
                    // only push tutors that are not the tutor the newest request was made to
                    for (i = 0; i < tutor.length; i++) {
                        if (tutor[i]._id != request[0].tutorId) {
                            validTutors.push(tutor[i]);
                        }
                        if (validTutors.length == 3) {
                            break;
                        }
                    }

                    res.send({error: false, data: validTutors});
                });
            }
        });
    };
};

module.exports = StudentController;