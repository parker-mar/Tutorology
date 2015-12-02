/**
 * Created by parkeraldricmar on 15-12-02.
 */

var should = require('should');
var async = require("async");
var server = require('supertest').agent('http://127.0.0.1:3000');
var test = require('./test.js');

describe('User Controller Test', function() {

    /* Before all */
    before(function(done) {
        async.series([
            function(cb) { test.createTutor(test.admin); cb(); },

            function(cb) { test.createTutor(test.physChemTutor); cb(); },
            function(cb) { test.createTutor(test.physTutor); cb(); },
            function(cb) { test.createTutor(test.chemTutor); cb(); },

            function(cb) { test.createStudent(test.physChemStudent); cb(); },
            function(cb) { test.createStudent(test.physChemStudent2); cb(); },

            function(cb) { test.createTopic(test.phys); cb(); },
            function(cb) { test.createTopic(test.chem); cb(); },
            function(cb) { test.addTopic(test.physChemTutor, test.phys); cb(); },
            function(cb) { test.addTopic(test.physChemTutor, test.chem); cb(); },
            function(cb) { test.addTopic(test.physTutor, test.phys); cb(); },
            function(cb) { test.addTopic(test.chemTutor, test.chem); cb(); },

            function(cb) { test.createAndAddRequest(test.physRequest, test.physChemStudent, test.physChemTutor, test.phys); cb(); },
            function(cb) { test.createAndAddRequest(test.chemRequest, test.physChemStudent, test.physChemTutor, test.chem); cb(); },

            function(cb) { test.createAndAddReview(test.physChemTutorReviewGood, test.physChemStudent, test.physChemTutor); cb(); },
            function(cb) { test.createAndAddReview(test.physChemTutorReviewBad, test.physChemStudent, test.physChemTutor); cb(); }
        ], done);
    });

    /* After all */
    after(function(done) {
        async.series([
            function(cb) { test.deleteTutor(test.admin); cb(); },

            function(cb) { test.deleteTutor(test.physChemTutor); cb(); },
            function(cb) { test.deleteTutor(test.physTutor); cb(); },
            function(cb) { test.deleteTutor(test.chemTutor); cb(); },

            function(cb) { test.deleteStudent(test.physChemStudent); cb(); },
            function(cb) { test.deleteStudent(test.physChemStudent2); cb(); },

            function(cb) { test.deleteTopic(test.phys); cb(); },
            function(cb) { test.deleteTopic(test.chem); cb(); },

            function(cb) { test.deleteRequest(test.physRequest); cb(); },
            function(cb) { test.deleteRequest(test.chemRequest); cb(); },

            function(cb) { test.deleteReview(test.physChemTutorReviewGood); cb(); },
            function(cb) { test.deleteReview(test.physChemTutorReviewBad); cb(); }
        ], done);
    });

    /* Before each */
    beforeEach(function(done) {
        server
            .post('/api/login')
            .send(test.physChemTutor)
            .expect(200)
            .expect(function(res) {
                res.body.data._id.should.equal(test.physChemTutor._id.toString());
            })
            .end(function(err){
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    /* After each */
    afterEach(function(done) {
        server
            .post('/api/logout')
            .expect(200)
            .end(function(err){
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    /* Test getAllUsers */
    describe('Test getAllUsers', function() {

        it('Get all users', function(done){
            server
                .get('/api/users')
                .expect(200)
                .expect(function (res) {
                    var userIds = res.body.data.map(function(user) {
                        return user._id;
                    });

                    userIds.indexOf(test.admin._id.toString()).should.be.greaterThan(-1);
                    userIds.indexOf(test.physChemTutor._id.toString()).should.be.greaterThan(-1);
                    userIds.indexOf(test.physTutor._id.toString()).should.greaterThan(-1);
                    userIds.indexOf(test.chemTutor._id.toString()).should.greaterThan(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test getUser */
    describe('Test getUser', function() {

        it('Get a user', function(done){
            server
                .get('/api/users/' + test.admin._id)
                .expect(200)
                .expect(function (res) {
                    res.body.data._id.should.equal(test.admin._id.toString());
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test updateUser */
    //describe('Test updateUser', function() {
    //
    //    it('Update a user', function(done){
    //        server
    //            .put('/api/users/' + test.admin._id)
    //            .send({
    //                displayName: "a",
    //                description: "b",
    //                image: "c"
    //            })
    //            .expect(200)
    //            .expect(function(res) {
    //                var request = res.body.data;
    //
    //                request.hasResponse.should.equal(true);
    //                request.accepted.should.equal(true);
    //                request.response.should.equal(response);
    //
    //                test.physRequest.hasResponse = true;
    //                test.physRequest.accepted = true;
    //                test.physRequest.response = response;
    //            })
    //            .end(function(err){
    //                if (err) {
    //                    return done(err);
    //                }
    //                done();
    //            });
    //    });
    //});
});