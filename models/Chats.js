/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate');

    var ChatSchema = new app.mongoose.Schema({
        fromId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users', required: true},
        toId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users', required: true},
        messages: [{ type: app.mongoose.SchemaTypes.ObjectId, ref: 'ChatMessages'}]
    });

    ChatSchema.plugin(findOrCreate);

    return app.mongoose.model('Chats', ChatSchema);
};