/**
 * Created by ahmedel-baz on 15-11-05.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate')
    var UserSchema = new app.mongoose.Schema({
        // Account details
        email: {type: String, index: {unique: true, dropDups: true}},
        password: String,
        authorization: String,

        // User details
        displayName: String,
        profile: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Profiles'},
        activities: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Activities'}],
        connections: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Connections'}],
        requests: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Requests'}],
        reviews: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Reviews'}],
        topics: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Topics'}],
        referrals: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Referrals'}]
    }, { discriminatorKey: 'userType' });

    UserSchema.plugin(findOrCreate);

    var UsersModel = app.mongoose.model('Users', UserSchema);

    UsersModel.defaultFilter = '_id email authorization displayName profile activities connections requests reviews topics referrals charge';

    return UsersModel;
};
