/**
 * Created by parkeraldricmar on 15-11-25.
 */
var TutorController = function(app) {

    var Tutors = app.models.Tutors;
    var Topics = app.models.Topics;
    var Requests = app.models.Requests;
    var Reviews = app.models.Reviews;
    var activityLogger = app.activityLogger;

    function getTutorsQuery (req, res, next, query) {
        Tutors.find(query, Tutors.defaultFilter).exec(function (err, tutors) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            res.send({error: false, data: tutors});
        });
    }
    
//  Gets tutors according to query, or all if none.
//  @bodyarg {String} name      The tutor's name to query by (optional).
//  @bodyarg {String} topicName The tutor's topicName to query by (optional).
//  @returns {Response} Tutors in the database according to query, or all if none.
    this.getTutors = function (req, res, next) {
        var name = req.body.name;
        var topicName = req.body.topicName;

        // Pass in query options
        var query = {};
        if (typeof name !== "undefined") {
            query.displayName = name;
        }
        if (typeof topicName !== "undefined") {
            Topics.findOne({name: topicName}).exec(function (err, topic) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                if (topic === null) {
                    var errMsg = "Error: No tutor teaches the topic with the given topicName.";
                    console.log(errMsg);
                    res.status(400).send({error: true, message: errMsg});
                    return;
                }

                query.topics = {"$all": topic};

                getTutorsQuery (req, res, next, query);
            });
            return;
        }

        getTutorsQuery (req, res, next, query);
    };

// Adds a topic to the list of topics taught by a tutor.
// @paramarg {String} tutorId       The ID of the tutor the topic is to be added to.
// @bodyarg {String} topicName      The name of the topic.
// @returns {Response}              The result of of the create operation.
    this.addTopic = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var topicName = req.body.topicName;

        if (typeof topicName === "undefined") {
            var errMsg = "Error: topicName unspecified.";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }

        // Upsert the topic
        Topics.findOneAndUpdate({name:topicName}, {$setOnInsert:{name:topicName}}, {upsert:true}, function (err, topic) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error:true,message:"An internal server error occurred."});
                return;
            }

            // Add it to the list of topics taught by the tutor, if it isn't there already.
            Tutors.findById(tutorId, Tutors.defaultFilter).exec(function (err, tutor) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                if (tutor.topics.indexOf(topic._id) > -1) {
                    var errMsg = "Error: topic already added.";
                    console.log(errMsg);
                    res.status(400).send({error: true, message: errMsg});
                    return;
                }

                tutor.topics.push(topic);

                tutor.save(function (err) {
                    if (err) {
                        console.log(err.message);
                        res.status(500).send({error: true, message: "An internal server error occurred."});
                        return;
                    }

                    activityLogger.logActivity(tutorId,"update tutor",tutor);
                    res.send({error: false, data: topic});
                });
            });
        });
    };

//  Gets all topics taught by the tutor with ID tutorId.
//  @paramarg {String} tutorId      The ID of the tutor.
//  @returns {Response}             All the topics taught by the tutor with ID tutorId.
    this.getTopics = function (req, res, next) {
        var tutorId = req.params.tutorId;

        Tutors.findById(tutorId, Tutors.defaultFilter).exec(function (err, tutor) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            res.send({error: false, data: tutor.topics});
        });
    };


//  Removes the topic from the list of topics taught by a tutor
//  (Not bothering to delete if no more references)
//  @paramarg {String} tutorId       The ID of the tutor the topic is to be removed from.
//  @paramarg {String} topicId       The ID of the topic is to be removed.
//  @returns {Response}              The result of of the update operation.
    this.removeTopic = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var topicId = req.params.topicId;

        Tutors.findById(tutorId, Tutors.defaultFilter).exec(function (err, tutor) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            tutor.topics.splice(tutor.topics.indexOf(topicId), 1);

            tutor.save(function (err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                activityLogger.logActivity(tutorId,"update tutor",tutor);
                res.send({error: false, data: topicId});
            });
        });
    };

//  Gets all requests made to the tutor with ID tutorId.
//  @paramarg {String} tutorId      The ID of the tutor.
//  @returns {Response}             All the requests made to the tutor with ID tutorId.
    this.getRequests = function (req, res, next) {
        var tutorId = req.params.tutorId;

        Tutors.findById(tutorId, Tutors.defaultFilter).exec(function (err, tutor) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            res.send({error: false, data: tutor.requests});
        });
    };

//  Updates the request to the tutor with a response
//  @paramarg {String} tutorId       The ID of the tutor responding to the request.
//  @paramarg {String} requestId     The ID of the request.
//  @bodyarg {Boolean} accepted      Whether the request was accepted.
//  @bodyarg {String} response       The response message (optional).
//  @returns {Response}              The result of of the update operation.
    this.respondToRequest = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var requestId = req.params.requestId;
        var accepted = req.body.accepted;
        var response = req.body.response === "undefined" ? "" : req.body.response;

        if (typeof accepted === "undefined") {
            var errMsg = "Error: accepted unspecified.";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }

        Requests.findById(requestId).exec(function (err, request) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            request.hasResponse = true;
            request.accepted = accepted;
            request.response = response;

            request.save(function (err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                activityLogger.logActivity(requestId,"update request",request);
                res.send({error: false, data: requestId});
            });
        });
    };

//  Gets all reviews for the tutor with ID tutorId.
//  @paramarg {String} tutorId      The ID of the tutor.
//  @returns {Response}             All the reviews for the tutor with ID tutorId.
    this.getReviews = function (req, res, next) {
        var tutorId = req.params.tutorId;

        Tutors.findById(tutorId, Tutors.defaultFilter).exec(function (err, tutor) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            res.send({error: false, data: tutor.reviews});
        });
    };

//  Flags the review
//  @paramarg {String} tutorId       The ID of the tutor flagging the review.
//  @paramarg {String} reviewId      The ID of the review.
//  @bodyarg {String} reason         The reason for flagging (optional).
//  @returns {Response}              The result of of the update operation.
    this.flagReview = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var reviewId = req.params.reviewId;
        var reason = req.body.reason === "undefined" ? "" : req.body.reason;

        if (typeof accepted === "undefined") {
            var errMsg = "Error: accepted unspecified.";
            console.log(errMsg);
            res.status(400).send({error: true, message: errMsg});
            return;
        }

        Reviews.findById(reviewId).exec(function (err, review) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            review.reason = reason;

            review.save(function (err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                activityLogger.logActivity(reviewId,"update review",review);
                res.send({error: false, data: reviewId});
            });
        });
    };

//  Removes the review from the list of reviews for a tutor
//  (Not bothering to delete if no more references)
//  @paramarg {String} tutorId       The ID of the tutor the topic is to be removed from.
//  @paramarg {String} topicId       The ID of the topic is to be removed.
//  @returns {Response}              The result of the update operation.
    this.removeReview = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var reviewId = req.params.reviewId;

        Tutors.findById(tutorId, Tutors.defaultFilter).exec(function (err, tutor) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            tutor.reviews.splice(tutor.reviews.indexOf(reviewId), 1);

            tutor.save(function (err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                activityLogger.logActivity(tutorId,"update tutor",tutor);
                res.send({error: false, data: reviewId});
            });
        });
    };

    this.respondToRequest = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.updateRequest = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };


    this.createRequest = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.createReview = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.flagReview = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

};

module.exports = TutorController;