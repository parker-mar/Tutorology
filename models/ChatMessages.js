/**
 * Created by parkeraldricmar on 15-11-25.
 */
module.exports = function(app){
    var ChatSchema = new app.mongoose.Schema({
        fromId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        toId: { type: app.mongoose.SchemaTypes.ObjectId, ref: 'Users'},
        when: { type: Date, required: true, default: Date.now },
        message: String,
        isRead: Boolean,
    });

    return app.mongoose.model('Chats', ChatSchema);
};