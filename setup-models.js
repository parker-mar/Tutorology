/**
 * Created by ahmedel-baz on 15-11-05.
 */
module.exports = function(app) {

    //Initializes all the models, and attaches them to the 'app' object,
    var models = [
        'Users',
        'Tutors',
        'Students',
        'Topics',
        'Profiles',
        'Connections',
        'Activities',
        'Referrals',
        'Requests',
        'Reviews',
        'ChatMessages',
        'Chats'
    ];

    app.models = {};
    models.forEach(function(model){
        app.models[model] = require('./models/'+model)(app);
    });
};