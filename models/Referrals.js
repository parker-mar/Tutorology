/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate')
    var ReferralSchema = new app.mongoose.Schema({
        fromStudentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students'},
        toStudentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students'},
        tutorId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Tutors'},
        created_at: { type: Date, required: true, default: Date.now },
        message: String,
        isRead: Boolean
    });

    ReferralSchema.plugin(findOrCreate);

    return app.mongoose.model('Referrals', ReferralSchema);
};