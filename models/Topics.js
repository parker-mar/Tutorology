/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var TopicSchema = new app.mongoose.Schema({
        name: {type: String, unique: true}
    });

    return app.mongoose.model('Topics', TopicSchema);
};