/**
 * Created by parkeraldricmar on 15-11-29.
 */

var should = require('should');
var async = require("async");
var server = require('supertest').agent('http://127.0.0.1:3000');
var test = require('./test.js');

describe('Tutor Controller Test', function() {

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

            function(cb) { test.createRequest(test.physRequest); cb(); },
            function(cb) { test.createRequest(test.chemRequest); cb(); },
            function(cb) { test.addRequest(test.physChemStudent, test.physChemTutor, test.physRequest); cb(); },
            function(cb) { test.addRequest(test.physChemStudent, test.physChemTutor, test.chemRequest); cb(); },

            function(cb) { test.createReview(test.physChemTutorReviewGood); cb(); },
            function(cb) { test.createReview(test.physChemTutorReviewBad); cb(); },
            function(cb) { test.addReview(test.physChemStudent, test.physChemTutor, test.physChemTutorReviewGood); cb(); },
            function(cb) { test.addReview(test.physChemStudent2, test.physChemTutor, test.physChemTutorReviewBad); cb(); }
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

    /* Test getTutors */
    describe('Test getTutors', function() {

        it('Get all tutors', function(done) {
            server
                .post('/api/get-tutors')
                .expect(200)
                .expect(function(res) {
                    var tutorIds = res.body.data.map(function(tutor) {
                        return tutor._id;
                    });

                    tutorIds.indexOf(test.physChemTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(test.physTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(test.chemTutor._id.toString()).should.be.greaterThan(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Get tutor by name', function(done){
            server
                .post('/api/get-tutors')
                .send({
                    name: test.physChemTutor.displayName
                })
                .expect(200)
                .expect(function (res) {
                    var tutorIds = res.body.data.map(function(tutor) {
                        return tutor._id;
                    });

                    tutorIds.indexOf(test.physChemTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(test.physTutor._id.toString()).should.equal(-1);
                    tutorIds.indexOf(test.chemTutor._id.toString()).should.equal(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Get tutor by topicName', function(done){
            server
                .post('/api/get-tutors')
                .send({
                    topicName: test.phys.name
                })
                .expect(200)
                .expect(function (res) {
                    var tutorIds = res.body.data.map(function(tutor) {
                        return tutor._id;
                    });

                    tutorIds.indexOf(test.physChemTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(test.physTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(test.chemTutor._id.toString()).should.equal(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Get tutor by name and topicName', function(done){
            server
                .post('/api/get-tutors')
                .send({
                    name: test.physChemTutor.displayName,
                    topicName: test.physTutor.topics[0].name
                })
                .expect(200)
                .expect(function (res) {
                    var tutorIds = res.body.data.map(function(tutor) {
                        return tutor._id;
                    });

                    tutorIds.indexOf(test.physChemTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(test.physTutor._id.toString()).should.equal(-1);
                    tutorIds.indexOf(test.chemTutor._id.toString()).should.equal(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test addTopic */
    describe('Test addTopic', function() {

        it('Add a topic', function(done) {
            server
                .post('/api/tutors/' + test.physChemTutor._id + '/topics')
                .send({
                    topicName: test.topicToAdd.name
                })
                .expect(200)
                .expect(function (res) {
                    var topic = res.body.data;

                    topic.name.should.equal(test.topicToAdd.name);

                    test.topicToAdd._id = topic._id;
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("Check that the topic is added to the tutor's list of topics", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/topics')
                .expect(200)
                .expect(function(res) {
                    var topicNames = res.body.data.map(function(topic) {
                        return topic.name;
                    });

                    topicNames.indexOf(test.topicToAdd.name).should.be.greaterThan(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Remove the topic', function(done) {
            server
                .delete('/api/tutors/' + test.physChemTutor._id + '/topics/' + test.topicToAdd._id)
                .expect(200)
                .expect(function(res) {
                    var topicId = res.body.data;

                    topicId.should.equal(test.topicToAdd._id.toString());
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test getTopics */
    describe('Test getTopics', function() {

        it('Get all topics for the tutor', function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/topics')
                .expect(200)
                .expect(function(res) {
                    var topicIds = res.body.data.map(function(topic) {
                        return topic._id;
                    });

                    topicIds.indexOf(test.phys._id.toString()).should.be.greaterThan(-1);
                    topicIds.indexOf(test.chem._id.toString()).should.be.greaterThan(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test removeTopic */
    describe('Test removeTopic', function() {

        it('Remove the topic', function(done) {
            server
                .delete('/api/tutors/' + test.physChemTutor._id + '/topics/' + test.phys._id)
                .expect(200)
                .expect(function(res) {
                    var topicId = res.body.data;

                    topicId.should.equal(test.phys._id.toString());
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("Check that the topic is removed from the tutor's list of topics", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/topics')
                .expect(200)
                .expect(function(res) {
                    var topicNames = res.body.data.map(function(topic) {
                        return topic.name;
                    });

                    topicNames.indexOf(test.phys.name).should.equal(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Readd the topic', function(done) {
            server
                .post('/api/tutors/' + test.physChemTutor._id + '/topics')
                .send({
                    topicName: test.phys.name
                })
                .expect(200)
                .expect(function (res) {
                    var topic = res.body.data;

                    topic.name.should.equal(test.phys.name);

                    test.phys._id = topic._id;
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test getRequests */
    describe('Test getRequests', function() {

        it('Get all requests for the tutor', function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/requests')
                .expect(200)
                .expect(function(res) {
                    var requestIds = res.body.data.map(function(request) {
                        return request._id;
                    });

                    requestIds.indexOf(test.physRequest._id.toString()).should.be.greaterThan(-1);
                    requestIds.indexOf(test.chemRequest._id.toString()).should.be.greaterThan(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test respondToRequest */
    describe('Test respondToRequest', function() {

            var response = "Certainly! See you at BA3200 @ 5PM tomorrow.";

        it('Accept a request and give a response', function(done) {
            server
                .put('/api/tutors/' + test.physChemTutor._id + '/requests/' + test.physRequest._id)
                .send({
                    accepted: true,
                    response: response
                })
                .expect(200)
                .expect(function(res) {
                    var request = res.body.data;

                    request.hasResponse.should.equal(true);
                    request.accepted.should.equal(true);
                    request.response.should.equal(response);

                    test.physRequest.hasResponse = true;
                    test.physRequest.accepted = true;
                    test.physRequest.response = response;
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("Check that the request in the tutor's list of requests is updated accordingly", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/requests')
                .expect(200)
                .expect(function(res) {
                    var requests = res.body.data;
                    var requestIds = requests.map(function(request) {
                        return request._id;
                    });

                    var request = requests[requestIds.indexOf(test.physRequest._id.toString())];
                    request.hasResponse.should.equal(true);
                    request.accepted.should.equal(true);
                    request.response.should.equal(response);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Decline a request and give no response', function(done) {
            server
                .put('/api/tutors/' + test.physChemTutor._id + '/requests/' + test.chemRequest._id)
                .send({
                    accepted: false
                })
                .expect(200)
                .expect(function(res) {
                    var request = res.body.data;

                    request.hasResponse.should.equal(true);
                    request.accepted.should.equal(false);
                    should.equal(request.response, undefined);

                    test.physRequest.hasResponse = true;
                    test.physRequest.accepted = false;
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("Check that the request in the tutor's list of requests is updated accordingly", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/requests')
                .expect(200)
                .expect(function(res) {
                    var requests = res.body.data;
                    var requestIds = requests.map(function(request) {
                        return request._id;
                    });

                    var request = requests[requestIds.indexOf(test.chemRequest._id.toString())];
                    request.hasResponse.should.equal(true);
                    request.accepted.should.equal(false);
                    should.equal(request.response, undefined);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test getReviews */
    describe('Test getReviews', function() {

        it('Get all reviews for the tutor', function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/reviews')
                .expect(200)
                .expect(function(res) {
                    var reviewIds = res.body.data.map(function(review) {
                        return review._id;
                    });

                    reviewIds.indexOf(test.physChemTutorReviewGood._id.toString()).should.be.greaterThan(-1);
                    reviewIds.indexOf(test.physChemTutorReviewBad._id.toString()).should.be.greaterThan(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test setReviewFlag */
    describe('Test setReviewFlag', function() {

        var reason = "Review is unfair!";

        it('Flag a review as a non-admin tutor and give a reason', function(done) {
            server
                .put('/api/tutors/' + test.physChemTutor._id + '/reviews/' + test.physChemTutorReviewBad._id)
                .send({
                    flagged: true,
                    reason: reason
                })
                .expect(200)
                .expect(function(res) {
                    var review = res.body.data;

                    review.flagged.should.equal(true);
                    review.reason.should.equal(reason);

                    test.physChemTutorReviewBad.flagged = true;
                    test.physChemTutorReviewBad.reason = reason;
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("Check that the review in the tutor's list of reviews is updated accordingly", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/reviews')
                .expect(200)
                .expect(function(res) {
                    var reviews = res.body.data;
                    var reviewIds = reviews.map(function(review) {
                        return review._id;
                    });

                    var review = reviews[reviewIds.indexOf(test.physChemTutorReviewBad._id.toString())];
                    review.flagged.should.equal(true);
                    review.reason.should.equal(reason);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("Unflag a review as an admin and don't update the reason", function(done) {
            async.series([
                function(cb) {
                    server
                        .post('/api/logout')
                        .expect(200)
                        .end(cb);
                },
                function(cb) {
                    server
                        .post('/api/login')
                        .send(test.admin)
                        .expect(200)
                        .expect(function (res) {
                            res.body.data._id.should.equal(test.admin._id.toString());
                        })
                        .end(cb);
                },
                function(cb) {
                    server
                        .put('/api/tutors/' + test.physChemTutor._id + '/reviews/' + test.physChemTutorReviewBad._id)
                        .send({
                            flagged: false
                        })
                        .expect(200)
                        .expect(function(res) {
                            var review = res.body.data;

                            review.flagged.should.equal(false);
                            review.reason.should.equal(reason);

                            test.physChemTutorReviewBad.flagged = false;
                        })
                        .end(cb);
                },
                function(cb) {
                    server
                        .post('/api/logout')
                        .expect(200)
                        .end(cb);
                },
                function (cb) {
                    server
                        .post('/api/login')
                        .send(test.physChemTutor)
                        .expect(200)
                        .expect(function (res) {
                            res.body.data._id.should.equal(test.physChemTutor._id.toString());
                        })
                        .end(cb);
                }
            ], function(err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it("Check that the review in the tutor's list of reviews is updated accordingly", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/reviews')
                .expect(200)
                .expect(function(res) {
                    var reviews = res.body.data;
                    var reviewIds = reviews.map(function(review) {
                        return review._id;
                    });

                    var review = reviews[reviewIds.indexOf(test.physChemTutorReviewBad._id.toString())];
                    console.log(review);
                    review.flagged.should.equal(false);
                    review.reason.should.equal(reason);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Attempt to flag a review as a non-admin, non-tutor', function(done) {
            async.series([
                function(cb) {
                    server
                        .post('/api/logout')
                        .expect(200)
                        .end(cb);
                },
                function(cb) {
                    server
                        .post('/api/login')
                        .send(test.physChemStudent)
                        .expect(200)
                        .expect(function(res) {
                            res.body.data._id.should.equal(test.physChemStudent._id.toString());
                        })
                        .end(cb);
                },
                function(cb) {
                    server
                        .put('/api/tutors/' + test.physChemTutor._id + '/reviews/' + test.physChemTutorReviewBad._id)
                        .send({
                            flagged: true
                        })
                        .expect(401)
                        .expect(function (res) {
                            res.body.message.should.equal("User missing appropriate tutor or admin privileges.");
                        })
                        .end(cb);
                },
                function(cb) {
                    server
                        .post('/api/logout')
                        .expect(200)
                        .end(cb);
                },
                function(cb) {
                    server
                        .post('/api/login')
                        .send(test.physChemTutor)
                        .expect(200)
                        .expect(function (res) {
                            res.body.data._id.should.equal(test.physChemTutor._id.toString());
                        })
                        .end(cb);
                }
            ], function(err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it("Check that the review in the tutor's list of reviews remains accordingly", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/reviews')
                .expect(200)
                .expect(function(res) {
                    var reviews = res.body.data;
                    var reviewIds = reviews.map(function(review) {
                        return review._id;
                    });

                    var review = reviews[reviewIds.indexOf(test.physChemTutorReviewBad._id.toString())];
                    review.flagged.should.equal(false);
                    review.reason.should.equal(reason);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    /* Test removeReview */
    describe('Test removeReview', function() {

        it('Remove a review as an admin', function(done) {
            async.series([
                function(cb) {
                    server
                        .post('/api/logout')
                        .expect(200)
                        .end(cb);
                },
                function(cb) {
                    server
                        .post('/api/login')
                        .send(test.admin)
                        .expect(200)
                        .expect(function(res) {
                            res.body.data._id.should.equal(test.admin._id.toString());
                        })
                        .end(cb);
                },
                function(cb) {
                    server
                        .delete('/api/tutors/' + test.physChemTutor._id + '/reviews/' + test.physChemTutorReviewBad._id)
                        .expect(200)
                        .expect(function(res) {
                            var reviewId = res.body.data;

                            reviewId.should.equal(test.physChemTutorReviewBad._id.toString());
                        })
                        .end(cb);
                },
                function(cb) {
                    server
                        .post('/api/logout')
                        .expect(200)
                        .end(cb);
                },
                function(cb) {
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
                }
            ], function(err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it("Check that the review is removed from the tutor's list of reviews", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/reviews')
                .expect(200)
                .expect(function(res) {
                    var reviewMessages = res.body.data.map(function(review) {
                        return review.message;
                    });

                    // Not unique, but close and safe enough.
                    reviewMessages.indexOf(test.physChemTutorReviewBad.message).should.equal(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Attempt to remove a review as a non-admin', function(done) {
            server
                .delete('/api/tutors/' + test.physChemTutor._id + '/reviews/' + test.physChemTutorReviewGood._id)
                .expect(401)
                .expect(function(res) {
                    res.body.message.should.equal("User does not have required privileges.");
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("Check that the review remains in the tutor's list of reviews", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/reviews')
                .expect(200)
                .expect(function(res) {
                    var reviewMessages = res.body.data.map(function(review) {
                        return review.message;
                    });

                    // Not unique, but close and safe enough.
                    reviewMessages.indexOf(test.physChemTutorReviewGood.message).should.be.greaterThan(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });
});