/**
 * Created by parkeraldricmar on 15-11-25.
 */
var TutorController = function(app) {

    var Tutors = app.models.Tutors;
    var Topics = app.models.Topics;
    var Requests = app.models.Requests;
    var Reviews = app.models.Reviews;
    var activityLogger = app.activityLogger;

//  Gets tutors according to query: exactly one of tutor name or topic name must be specified.
//  @bodyarg {String} name      The tutor name to regex match query by (optional).
//  @bodyarg {String} topicName The topic name to regex match query by (optional).
//  @returns {Response}         Tutors in the database according to query, populated with profile and topics.
//      If query has name, sort ascending by topic name.
//      If query has topicName, sort ascending by tutor name.
    this.getTutors = function (req, res, next) {
        var name = req.body.name;
        var topicName = req.body.topicName;

        if (typeof name !== "undefined") {

            // Query has tutor name
            Tutors
                .find({displayName: new RegExp("^"+name)}, Tutors.defaultFilter)
                .populate([
                    {path: 'profile'},
                    {path: 'topics', options: {sort: {name: 1}}}])
                .exec(function (err, tutors) {
                    if (err) {
                        console.log(err.message);
                        res.status(500).send({error: true, message: "An internal server error occurred."});
                        return;
                    }

                    res.send({error: false, data: tutors});
                });
        } else {

            // Query has topic name
            Topics.findOne({name: new RegExp("^"+topicName)}).exec(function (err, topic) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                Tutors
                    .find({topics: {"$all": topic}}, Tutors.defaultFilter)
                    .sort({'displayName': 1})
                    .populate([
                        {path: 'profile'},
                        {path: 'topics'}])
                    .exec(function (err, tutors) {
                        if (err) {
                            console.log(err.message);
                            res.status(500).send({error: true, message: "An internal server error occurred."});
                            return;
                        }

                        res.send({error: false, data: tutors});
                    });
            });
        }
    };



//  Gets the tutor
//  @paramarg {String} tutorId       The ID of the tutor to get.
//  @returns {Response}              Tutor in the database, populated with profile, topics, reviews,
//  student in the review, profile in the student.
    this.getTutor = function(req, res, next) {
        var tutorId = req.params.tutorId;

        Tutors
            .findById(tutorId, Tutors.defaultFilter)
            .populate([
                {path: 'profile'},
                {path: 'topics'},
                {path: 'reviews', populate:
                    {path: 'studentId', populate:
                        {path: 'profile'}}}])
            .exec(function (err, tutor) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                res.send({error: false, data: tutor});
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
        Topics.findOrCreate({name:topicName}, {$setOnInsert:{name:topicName}}, {upsert:true}, function (err, topic) {
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
//  @returns {Response}             All the topics taught by the tutor with ID tutorId sorted ascending by topic name.
    this.getTopics = function (req, res, next) {
        var tutorId = req.params.tutorId;

        Tutors.findById(tutorId, Tutors.defaultFilter)
            .populate({path: 'topics', options: {sort: {name: 1}}})
            .exec(function (err, tutor) {
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
//  @returns {Response}             All the requests made to the tutor with ID tutorId sorted descending by created_at,
//  with the student in the request, profile of the student, and the topic in the request.
    this.getRequests = function (req, res, next) {
        var tutorId = req.params.tutorId;

        Requests
            .find({tutorId: tutorId})
            .sort({'created_at': 1})
            .populate([
                {path: 'studentId', populate:
                    {path: 'profile'}},
                {path: 'topicId'}])
            .exec(function (err, requests) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                res.send({error: false, data: requests});
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
        var response = req.body.response;

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

            if (typeof response !== "undefined") {
                request.response = response;
            }

            request.save(function (err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                activityLogger.logActivity(requestId,"update request",request);
                res.send({error: false, data: request});
            });
        });
    };

//  Gets all reviews for the tutor with ID tutorId.
//  @paramarg {String} tutorId      The ID of the tutor.
//  @returns {Response}             All the reviews for the tutor with ID tutorId, sorted descending by created_at,
//  with the student in the request, profile of the student, the tutor in the request, and the profile of the tutor.
    this.getReviews = function (req, res, next) {
        var tutorId = req.params.tutorId;

        Reviews
            .find({tutorId: tutorId})
            .sort({'created_at': 1})
            .populate([
                {path: 'studentId', populate:
                    {path: 'profile'}},
                {path: 'tutorId', populate:
                    {path: 'profile'}}])
            .exec(function (err, reviews){
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                res.send({error: false, data: reviews});
        });
    };

//  Sets the review flag
//  @paramarg {String} tutorId       The ID of the tutor flagging the review.
//  @paramarg {String} reviewId      The ID of the review.
//  @bodyarg {Boolean} flagged       The flag.
//  @bodyarg {String} reason         The reason for flagging (optional).
//  @returns {Response}              The result of of the update operation.
    this.setReviewFlag = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var reviewId = req.params.reviewId;
        var flagged = req.body.flagged;
        var reason = req.body.reason;

        if (typeof flagged === "undefined") {
            var errMsg = "Error: flagged unspecified.";
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

            review.flagged = flagged;

            if (typeof reason !== "undefined") {
                review.reason = reason;
            }

            review.save(function (err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }

                activityLogger.logActivity(reviewId,"update review",review);
                res.send({error: false, data: review});
            });
        });
    };

//  Removes the review
//  @paramarg {String} tutorId       The ID of the tutor the topic is to be removed from.
//  @paramarg {String} reviewId      The ID of the review to be removed.
//  @returns {Response}              The result of the update operation.
    this.removeReview = function (req, res, next) {
        var tutorId = req.params.tutorId;
        var reviewId = req.params.reviewId;

        Reviews.findByIdAndRemove(reviewId).exec(function (err, review) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            res.send({error: false, data: review});
        });
    };

};

module.exports = TutorController;