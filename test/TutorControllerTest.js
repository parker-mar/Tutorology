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
            function(cb) { test.createTutor(test.physChemTutor); cb(null, null); },
            function(cb) { test.createTutor(test.physTutor); cb(null, null); },
            function(cb) { test.createTutor(test.chemTutor); cb(null, null); },

            function(cb) { test.createTopic(test.phys); cb(null, null); },
            function(cb) { test.createTopic(test.chem); cb(null, null); },

            function(cb) { test.addTopic(test.physChemTutor, test.phys); cb(null, null); },
            function(cb) { test.addTopic(test.physChemTutor, test.chem); cb(null, null); },
            function(cb) { test.addTopic(test.physTutor, test.phys); cb(null, null); },
            function(cb) { test.addTopic(test.chemTutor, test.chem); cb(null, null); },

            function(cb) { test.createStudent(test.physChemStudent); cb(null, null); },

            function(cb) { test.createRequest(test.physRequest); cb(null, null); },
            function(cb) { test.createRequest(test.chemRequest); cb(null, null); },

            function(cb) { test.addRequest(test.physChemStudent, test.physChemTutor, test.physRequest); cb(null, null); },
            function(cb) { test.addRequest(test.physChemStudent, test.physChemTutor, test.chemRequest); cb(null, null); },
        ], done);
    });

    /* After all */
    after(function(done) {
        async.series([
            function(cb) { test.deleteTutor(test.physChemTutor); cb(null, null); },
            function(cb) { test.deleteTutor(test.physTutor); cb(null, null); },
            function(cb) { test.deleteTutor(test.chemTutor); cb(null, null); },

            function(cb) { test.deleteTopic(test.phys); cb(null, null); },
            function(cb) { test.deleteTopic(test.chem); cb(null, null); },

            function(cb) { test.deleteStudent(test.physChemStudent); cb(null, null); },

            function(cb) { test.deleteRequest(test.physRequest); cb(null, null); },
            function(cb) { test.deleteRequest(test.chemRequest); cb(null, null); }
        ], done);
    });

    /* Before each */
    beforeEach(function(done) {
        server
            .post('/api/login')
            .send(test.physChemTutor)
            .expect(200)
            .expect(function(res) {
                res.body.data.should.have.property("email", test.physChemTutor.email);
            })
            .end(done);
    });

    /* After each */
    afterEach(function(done) {
        server
            .post('/api/logout')
            .expect(200)
            .end(done);
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
                .end(done);
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
                .end(done);
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
                .end(done);
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
                .end(done);
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
                .end(done);
        });

        it("Check that the topic is added to list of tutor's topics", function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/topics')
                .expect(200)
                .expect(function(res) {
                    var topicNames = res.body.data.map(function(topic) {
                        return topic.name;
                    });

                    topicNames.indexOf(test.phys.name).should.be.greaterThan(-1);
                    topicNames.indexOf(test.chem.name).should.be.greaterThan(-1);
                    topicNames.indexOf(test.topicToAdd.name).should.be.greaterThan(-1);
                })
                .end(done);
        });

        it('Remove the topic', function(done) {
            server
                .delete('/api/tutors/' + test.physChemTutor._id + '/topics/' + test.topicToAdd._id)
                .expect(200)
                .expect(function(res) {
                    var topicId = res.body.data;

                    topicId.should.equal(test.topicToAdd._id);
                })
                .end(done);
        });
    });

    /* Test getTopics */
    describe('Test getTopics', function() {

        it('Get all topics', function(done) {
            server
                .get('/api/tutors/' + test.physChemTutor._id + '/topics')
                .expect(200)
                .expect(function(res) {
                    var topicNames = res.body.data.map(function(topic) {
                        return topic.name;
                    });

                    topicNames.indexOf(test.phys.name).should.be.greaterThan(-1);
                    topicNames.indexOf(test.chem.name).should.be.greaterThan(-1);
                })
                .end(done);
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
                .end(done);
        });

        it('Read the topic', function(done) {
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
                .end(done);
        });
    });

    /* Test getRequests */
    describe('Test getRequests', function() {

        it('Get all requests', function(done) {
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
                .end(done);
        });
    });

    /* Test respondToRequest */
    describe('Test respondToRequest', function() {

        it('Accept a request and give a response', function(done) {
            server
                .put('/api/tutors/' + test.physChemTutor._id + '/requests/' + test.physRequest._id)
                .send({
                    accepted: true,
                    response: "Certainly! See you at BA3200 @ 5PM tomorrow."
                })
                .expect(200)
                .expect(function(res) {
                    var request = res.body.data;

                    request.hasResponse.should.equal(true);
                    request.accepted.should.equal(true);
                    request.response.should.equal("Certainly! See you at BA3200 @ 5PM tomorrow.");

                    test.physRequest.hasResponse = true;
                    test.physRequest.accepted = true;
                    test.physRequest.response = "Certainly! See you at BA3200 @ 5PM tomorrow.";
                })
                .end(done);
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
                .end(done);
        });
    });
});