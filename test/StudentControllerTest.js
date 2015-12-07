var should = require('should');
var async = require("async");
var server = require('supertest').agent('http://127.0.0.1:3000');
var test = require('./test.js');
var ref;

describe('Student Controller Test', function() {

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
            .send(test.physChemStudent)
            .expect(200)
            .expect(function(res) {
                res.body.data._id.should.equal(test.physChemStudent._id.toString());
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

    describe('Test getStudents', function () {

        it('Get students', function (done){
            server
                .get('/api/students')
                .expect(200)
                .expect(function (res) {
                    var studentIds = res.body.data.map(function(student) {
                        return student._id;
                    });

                    studentIds.indexOf(test.physChemStudent._id.toString()).should.be.greaterThan(-1);
                    studentIds.indexOf(test.physChemStudent2._id.toString()).should.be.greaterThan(-1);
                })
                .end(function(err){
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    describe('Test makeRequest', function () {

        it('Make Request', function (done) {
            server
                .post('/api/students/' + test.physChemStudent._id + '/requests')
                .send({
                    tutorId : test.physTutor._id,
                    topicName : test.phys.name,
                    message : "teach me phys"
                })
                .expect(200)
                .expect(function (res) {
                    res.body.data.studentId.should.equal(test.physChemStudent._id.toString());
                    res.body.data.tutorId.should.equal(test.physTutor._id.toString());
                    res.body.data.message.should.equal("teach me phys");
                })
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

    describe('Test getRequest', function () {

        it('Get Request', function (done) {
            server
                .get('/api/students/' + test.physChemStudent._id + '/requests')
                .expect(200)
                .expect(function (res) {
                    var studentIds = res.body.data.map(function(request) {
                        return request.studentId._id;
                    });
                    var tutorIds = res.body.data.map(function(request) {
                        return request.tutorId._id;
                    });
                    res.body.data.length.should.be.greaterThan(0);
                    studentIds.indexOf(test.physChemStudent._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(test.physTutor._id.toString()).should.be.greaterThan(-1);
                })
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

    describe('Test makeReview', function () {

        it('Make Review', function (done) {
            server
                .post('/api/students/' + test.physChemStudent._id + '/reviews')
                .send({
                    tutorId : test.physTutor._id,
                    rating : 4,
                    message : "you're aight"
                })
                .expect(200)
                .expect(function (res) {
                    res.body.data.studentId.should.equal(test.physChemStudent._id.toString());
                    res.body.data.tutorId.should.equal(test.physTutor._id.toString());
                    res.body.data.rating.should.equal(4);
                    res.body.data.message.should.equal("you're aight");
                })
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

    describe('Test makeReferral', function () {

        it('Make Referral', function (done) {
            server
                .post('/api/students/' + test.physChemStudent._id + '/referrals')
                .send({
                    tutorId : test.physTutor._id,
                    toStudentEmail : test.physChemStudent2.email,
                    message : "he's aight"
                })
                .expect(200)
                .expect(function (res) {
                    res.body.data.fromStudentId.should.equal(test.physChemStudent._id.toString());
                    res.body.data.toStudentId.should.equal(test.physChemStudent2._id.toString());
                    res.body.data.tutorId.should.equal(test.physTutor._id.toString());
                    res.body.data.message.should.equal("he's aight");
                    res.body.data.isRead.should.equal(false);
                    ref = res.body.data._id;
                })
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

    describe('Test getReferrals', function () {

        it('Get Referrals', function (done) {
            server
                .get('/api/students/' + test.physChemStudent2._id + '/referrals')
                .expect(200)
                .expect(function (res) {
                    var fromStudentIds = res.body.data.map(function(referral) {
                        return referral.fromStudentId._id;
                    });
                    var tutorIds = res.body.data.map(function(referral) {
                        return referral.tutorId._id;
                    });
                    var messages = res.body.data.map(function(referral) {
                        return referral.message;
                    });
                    res.body.data.length.should.be.greaterThan(0);
                    fromStudentIds.indexOf(test.physChemStudent._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(test.physTutor._id.toString()).should.be.greaterThan(-1);
                })
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

    describe('Test markReferralRead', function () {

        it('Mark Referral Read', function (done) {
            server
                .put('/api/students/' + test.physChemStudent2._id + '/referrals/' + ref)
                .send({
                    isRead : "true"
                })
                .expect(200)
                .expect(function (res) {
                    res.body.data._id.should.equal(ref);    
                    res.body.data.fromStudentId.should.equal(test.physChemStudent._id.toString());
                    res.body.data.toStudentId.should.equal(test.physChemStudent2._id.toString());
                    res.body.data.tutorId.should.equal(test.physTutor._id.toString());
                    res.body.data.message.should.equal("he's aight");
                    res.body.data.isRead.should.equal(true);
                })
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

    describe('Test getRecommendations', function () {

        it('Get Recommendations', function (done) {
            server
                .get('/api/students/' + test.physChemStudent._id + '/recommendations')
                .expect(200)
                .expect(function (res) {
                    res.body.data.length.should.be.greaterThan(0);
                })
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

});