/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate');

    var ReviewSchema = new app.mongoose.Schema({
        studentId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Students'},
        tutorId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Topics'},
        created_at: { type: Date, required: true, default: Date.now },
        rating: Number,
        message: String,
        flagged: { type: Boolean, default: false },
        reason: String
    });

    ReviewSchema.plugin(findOrCreate);

    return app.mongoose.model('Reviews', ReviewSchema);
};