/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var ReferralSchema = new app.mongoose.Schema({
        fromStudentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students'},
        toStudentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students'},
        tutorId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Tutors'},
        created_at: { type: Date, required: true, default: Date.now },
        message: String,
        isRead: Boolean
    });

    return app.mongoose.model('Referrals', ReferralSchema);
};