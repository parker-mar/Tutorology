/**
 * Created by ahmedel-baz on 15-11-05.
 */
module.exports = function(app){
    var UserSchema = new app.mongoose.Schema({
        displayName: String,
        email: {type: String, index: {unique: true, dropDups: true}},
        password: String,
        authorization: String,
        //Assuming ProfileSchema will be picked up by mongoose.
        profile: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Profiles'},
        //Assuming ActivitySchema will be picked up by mongoose.
        activities: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Activities'}],
        connections: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'Connections'}]
    });

    var UsersModel = app.mongoose.model('Users',UserSchema);

    UsersModel.defaultFilter = '_id displayName email authorization displayName profile activities connections';

    return UsersModel;
}