/**
 * Created by parkeraldricmar on 15-11-25.
 */
var TutorController = function(app) {

    var Tutors = app.models.Tutors;
    var Students = app.models.Students;
    var Topics = app.models.Topics;
    var Requests = app.models.Requests;
    var Reviews = app.models.Reviews;

//  Gets all tutors
//  @returns {Response} All the tutors in the database.
    this.getTutors = function (req, res, next) {
        Tutors.find({}, Tutors.defaultFilter)
            .exec(function (err, tutors) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                }
                res.send({error: false, data: tutors});
            });
    };

// Creates a new topic (of name topic) and adds it to the list of topics associated with the tutor with ID tutor_id.
// @paramarg {
    this.addTopic = function(req, res, next) {
        var tutorId = req.params.userId;

        //(app.mongoose.SchemaTypes.ObjectId tutor_id, String topic)

    };


//  Updates the target user
//  @paramarg {String} userId         The ID of the User to be changed.
//  @bodyarg {String} displayName     The new User displayName (optional).
//  @bodyarg {String} description     The new User description (optional).
//  @bodyarg {String} image           The new User image (optional).
//  @returns {Response}               The result of the update operation.
    this.updateUser = function (req, res, next) {
        var userId = req.params.userId;
        var displayName = req.body.displayName;
        var description = req.body.profile.description;
        var image = req.body.profile.image;
        var actorId = req.session.userId;
        Users.findById(userId)
            .populate('profile')
            .exec(function (err, user) {
                if (typeof displayName !== 'undefined')
                    user.displayName = displayName;

                user.save(function (err) {
                    if (err) {
                        console.log(err.message);
                        res.status(500).send({error: true, message: "An internal server error occurred."});
                    } else {
                        var profile = user.profile;
                        if (typeof description != 'undefined')
                            profile.description = description;
                        if (typeof image != 'undefined')
                            profile.image = image;
                        profile.save(function (err) {
                            if (err) {
                                console.log(err.message);
                                res.status(500).send({error: true, message: "An internal server error occurred."});
                            } else {
                                activityLogger.logActivity(actorId,"update_user",user);
                                res.send({error: false});
                            }
                        });
                    }
                });
            });
    };

};

module.exports = TutorController;