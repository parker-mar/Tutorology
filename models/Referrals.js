/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var ReferralSchema = new app.mongoose.Schema({
        from_student_id: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        to_student_id: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        tutor_id: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        created_at: { type: Date, required: true, default: Date.now },
        message: String,
        isRead: Boolean
    });

    return app.mongoose.model('Referrals', ReferralSchema);
};