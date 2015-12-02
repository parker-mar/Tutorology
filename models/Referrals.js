/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate');

    var ReferralSchema = new app.mongoose.Schema({
        fromStudentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students', required: true},
        toStudentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students', required: true},
        tutorId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Tutors', required: true},
        created_at: { type: Date, required: true, default: Date.now },
        message: String,
        isRead: { type: Boolean, default: false }
    });

    ReferralSchema.plugin(findOrCreate);

    return app.mongoose.model('Referrals', ReferralSchema);
};