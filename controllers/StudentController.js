/**
 * Created by parkeraldricmar on 15-11-30.
 */
var StudentController = function(app) {

    var Tutors = app.models.Tutors;
    var Students = app.models.Students;
    var Topics = app.models.Topics;
    var Requests = app.models.Requests;
    var Reviews = app.models.Reviews;
    var activityLogger = app.activityLogger;

    this.getStudents = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.makeRequest = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.getRequests = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.makeReview = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.makeReferral = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.getReferrals = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.markReferralRead = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };

    this.getRecommendations = function (req,res,next) {
        res.status(500).send({error: true, message: "Feature not implemented"});
    };
};

module.exports = StudentController;