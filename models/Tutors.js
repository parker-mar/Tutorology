/**
 * Created by parkeraldricmar on 15-11-26.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate');

    var TutorSchema = new app.mongoose.Schema({
        charge: { type: Number, min: 0 },
        rating: { type: Number, min: 0 }
    }, { discriminatorKey: 'userType' });

    TutorSchema.plugin(findOrCreate);

    var TutorsModel = app.models['Users'].discriminator('Tutors', TutorSchema);

    TutorsModel.defaultFilter = '_id email authorization displayName profile activities connections requests reviews topics referrals charge rating';

    return TutorsModel;
};

