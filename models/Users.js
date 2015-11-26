/**
 * Created by ahmedel-baz on 15-11-05.
 */
module.exports = function(app){
    var UserSchema = new app.mongoose.Schema({
        // Account details
        email: {type: String, index: {unique: true, dropDups: true}},
        password: String,
        authorization: String,

        // User details
        type: String,
        topics: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Topics'}],
        displayName: String,
        profile: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Profiles'},
        activities: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Activities'}],
        connections: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Connections'}]
    });

    var UsersModel = app.mongoose.model('Users', UserSchema);

    UsersModel.defaultFilter = '_id email authorization type topics displayName profile activities connections';

    return UsersModel;
};