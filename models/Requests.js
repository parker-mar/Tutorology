/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate');

    var RequestSchema = new app.mongoose.Schema({
        studentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students', required: true},
        tutorId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Tutors', required: true},
        topicId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Topics', required: true},
        created_at: { type: Date, required: true, default: Date.now },
        message: String,
        hasResponse: { type: Boolean, default: false },
        accepted: Boolean,
        response: String
    });

    RequestSchema.plugin(findOrCreate);

    return app.mongoose.model('Requests', RequestSchema);
};