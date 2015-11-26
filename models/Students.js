/**
 * Created by parkeraldricmar on 15-11-26.
 */
module.exports = function(app){
    var StudentSchema = new app.mongoose.Schema({}, { discriminatorKey: 'kind' });

    return app.models['Users'].discriminator('Students', StudentSchema);
};

