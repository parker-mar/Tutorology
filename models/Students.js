/**
 * Created by parkeraldricmar on 15-11-26.
 */
module.exports = function(app){
    var findOrCreate = require('mongoose-findorcreate');

    var StudentSchema = new app.mongoose.Schema({}, { discriminatorKey: 'userType' });

    StudentSchema.plugin(findOrCreate);

    return app.models['Users'].discriminator('Students', StudentSchema);
};

