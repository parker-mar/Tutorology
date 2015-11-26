/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var RequestSchema = new app.mongoose.Schema({
        student_id: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        tutor_id: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        last_updated: { type: Date, required: true, default: Date.now },
        message: String,
        accepted: Boolean,
        response: String
    });

    return app.mongoose.model('Requests', RequestSchema);
};