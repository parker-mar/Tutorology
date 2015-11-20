/**
 * Created by ahmedel-baz on 15-11-07.
 */
var ActivityLogger = function(app) {

    var Users = app.models.Users;
    var Activities = app.models.Activities;

//  Logs an activity containing information about the acting user's action.
    this.logActivity = function (actorId,type,target) {
        Users.findById(actorId,function(err,actor){
            if(err) {
                console.log(err);
            } else if(actor) {
                Activities.create({actor:actorId,type:type,target:{_id:target._id,email:target.email,displayName:target.displayName}},function(err,activity){
                    if(err) {
                        console.log(err);
                    } else {
                        actor.activities.push(activity);
                        actor.save(function (err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
            }
        });
    };


};

module.exports = ActivityLogger;