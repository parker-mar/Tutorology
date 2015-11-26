/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var ReviewSchema = new app.mongoose.Schema({
        student_id: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        tutor_id: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        when: { type: Date, required: true, default: Date.now },
        rating: Number,
        message: String,
        flagged: Boolean,
        reason: String
    });

    return app.mongoose.model('Reviews', ReviewSchema);
};