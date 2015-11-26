/**
 * Created by ahmedel-baz on 15-11-05.
 */
// TODO [Parker]: Move account stuff from Users.js to Accounts.js and details in Users.js that belong to Profiles.js to here?
module.exports = function(app){
    var ProfileSchema = new app.mongoose.Schema({
        description: {
            type: String,
            maxLength: 500
        },
        image: String
    });

    return app.mongoose.model('Profiles', ProfileSchema);
};