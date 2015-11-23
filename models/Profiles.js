/**
 * Created by ahmedel-baz on 15-11-05.
 */
module.exports = function(app){
    var ProfileSchema = new app.mongoose.Schema({
        description: {
            type: String,
            maxLength: 500
        },
        image: String
    });

    return app.mongoose.model('Profiles',ProfileSchema);
}