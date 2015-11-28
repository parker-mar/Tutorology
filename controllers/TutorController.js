/**
 * Created by parkeraldricmar on 15-11-25.
 */
var TutorController = function(app) {

    var Tutors = app.models.Tutors;
    var Topics = app.models.Topics;
    var Requests = app.models.Requests;
    var Reviews = app.models.Reviews;
    var activityLogger = app.activityLogger;

//  Gets all tutors
//  @returns {Response} All the tutors in the database.
    this.getTutors = function (req, res, next) {
        Tutors.find({}, Tutors.defaultFilter).exec(function (err, tutors) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
            }
            res.send({error: false, data: tutors});
        });
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
            Tutors.findById(tutorId).exec(function (err, tutor) {
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

//  Gets all topics
//  @returns {Response} All the topics in the database.
    this.getTopics = function (req, res, next) {
        Topics.find({}).exec(function (err, topics) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
            }
            res.send({error: false, data: topics});
        });
    };

//TODO: delete if no more references?
//  Removes the topic from the list of topics taught by a tutor
//  @paramarg {String} tutorId       The ID of the tutor the topic is to be removed from.
//  @paramarg {String} topicId       The ID of the topic is to be removed.
//  @returns {Response}              The result of of the update operation.
    this.removeTopic = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var topicId = req.params.topicId;

        Tutors.findById(tutorId).exec(function (err, tutor) {
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

//  Gets all requests
//  @returns {Response} All the requests in the database.
    this.getRequests = function (req, res, next) {
        Requests.find({}).exec(function (err, requests) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
            }
            res.send({error: false, data: requests});
        });
    };


    //this.respondToRequest

//  Gets all reviews
//  @returns {Response} All the reviews in the database.
    this.getReviews = function (req, res, next) {
        Reviews.find({}).exec(function (err, reviews) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
            }
            res.send({error: false, data: reviews});
        });
    };


    //this.flagReview

//TODO: delete if no more references?
//  Removes the review from the list of reviews for a tutor
//  @paramarg {String} tutorId       The ID of the tutor the topic is to be removed from.
//  @paramarg {String} topicId       The ID of the topic is to be removed.
//  @returns {Response}              The result of the update operation.
    this.removeReview = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var reviewId = req.params.reviewId;

        Tutors.findById(tutorId).exec(function (err, tutor) {
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

                activityLogger.logActivity(tutorId,"update tutor",review);
                res.send({error: false, data: reviewId});
            });
        });
    };

    this.respondToRequest = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    }

    this.flagReview = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    }


};

module.exports = TutorController;