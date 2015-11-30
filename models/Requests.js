/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate')
    var RequestSchema = new app.mongoose.Schema({
        studentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students'},
        tutorId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Tutors'},
        topicId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Topics'},
        created_at: { type: Date, required: true, default: Date.now },
        message: String,
        hasResponse: Boolean,
        accepted: Boolean,
        response: String
    });

    RequestSchema.plugin(findOrCreate);

    return app.mongoose.model('Requests', RequestSchema);
};