/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var ReviewSchema = new app.mongoose.Schema({
        studentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students'},
        tutorId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Topics'},
        when: { type: Date, required: true, default: Date.now },
        rating: Number,
        message: String,
        flagged: Boolean,
        reason: String
    });

    return app.mongoose.model('Reviews', ReviewSchema);
};