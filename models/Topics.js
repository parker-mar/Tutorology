/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate')
    var TopicSchema = new app.mongoose.Schema({
        name: {type: String, unique: true}
    });

    TopicSchema.plugin(findOrCreate);

    return app.mongoose.model('Topics', TopicSchema);
};