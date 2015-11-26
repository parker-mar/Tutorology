/**
 * Created by parkeraldricmar on 15-11-26.
 */
module.exports = function(app){
    var TutorSchema = new app.mongoose.Schema({}, { discriminatorKey: 'kind' });

    return app.models['Users'].discriminator('Tutors', TutorSchema);
};

