/**
 * Created by parkeraldricmar on 15-11-29.
 * Based on https://thewayofcode.wordpress.com/2013/04/21/how-to-build-and-test-rest-api-with-nodejs-express-mocha/
 */

var should = require('should');
var assert = require('assert');
var async = require("async");
var mongoose = require('mongoose');
var request = require('supertest');
var server = request.agent('http://127.0.0.1:3000');
var app = require('../server.js');

var Users = app.models.Users;
var Tutors = app.models.Tutors;
var Topics = app.models.Topics;
var Requests = app.models.Requests;
var Reviews = app.models.Reviews;
var Profiles = app.models.Profiles;

describe('Tutor Controller Test', function() {

    /* Shared Variables */
    var physChemTutor = {
        email: 'physchem@physchem_test.com',
        pass: '1',
        confirmPass: '1',
        displayName: 'physChemTutor',
        topics: [],
        charge: 0.00
    };

    var physTutor = {
        email: 'phys@phys_test.com',
        pass: '1',
        confirmPass: '1',
        displayName: 'physTutor',
        topics: [],
        charge: 0.00
    };

    var chemTutor = {
        email: 'chem@chem_test.com',
        pass: '1',
        confirmPass: '1',
        displayName: 'chemTutor',
        topics: [],
        charge: 0.00
    };

    var phys = {
        name: 'phys_test'
    };

    var chem = {
        name: 'chem_test'
    };

    var topicToAdd = {
        name: 'eng_test'
    };

    /* Test helper functions */
    function createTutor(tutorArg) {
        tutorArg.password = tutorArg.pass;

        Tutors.create(tutorArg, function(err, tutor) {
            if (err) {
                should.fail(err.message);
            }
            delete tutor._doc.password;
            delete tutor._doc.__v;
            tutorArg._id = tutor._id;
        });
    }

    function deleteTutor(tutorArg) {
        Tutors.remove({_id: tutorArg._id}, function (err) {
            if (err) {
                console.log(err.message);
            } else {
                console.log("tutor " + tutorArg._id + " Removed Successfully");
            }
        });
    }

    function createTopic(topicArg) {
        Topics.create(topicArg, function(err, topic) {
            if (err) {
                should.fail(err.message);
            }
            topicArg._id = topic._id;
        });
    }

    function deleteTopic(topicArg) {
        Topics.remove({_id: topicArg._id}, function (err) {
            if (err) {
                console.log(err.message);
            } else {
                console.log("topic " + topicArg._id + " Removed Successfully");
            }
        });
    }

    function addTopic(tutorArg, topicArg) {

        Tutors.findById(tutorArg._id, Tutors.defaultFilter).exec(function (err, tutor) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            tutorArg.topics.push(topicArg._id);

            tutor.topics.push(topicArg._id);

            tutor.save(function (err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send({error: true, message: "An internal server error occurred."});
                    return;
                }
            });
        });
    }

    /* Before all */
    before(function(done) {
        async.series([
            function(cb) { createTutor(physChemTutor); cb(null, null); },
            function(cb) { createTutor(physTutor); cb(null, null); },
            function(cb) { createTutor(chemTutor); cb(null, null); },

            function(cb) { createTopic(phys); cb(null, null); },
            function(cb) { createTopic(chem); cb(null, null); },

            function(cb) { addTopic(physChemTutor, phys); cb(null, null); },
            function(cb) { addTopic(physChemTutor, chem); cb(null, null); },
            function(cb) { addTopic(physTutor, phys); cb(null, null); },
            function(cb) { addTopic(chemTutor, chem); cb(null, null); }
        ], done);
    });

    /* After all */
    after(function(done) {
        async.series([
            function(cb) { deleteTutor(physChemTutor); cb(null, null); },
            function(cb) { deleteTutor(physTutor); cb(null, null); },
            function(cb) { deleteTutor(chemTutor); cb(null, null); },

            function(cb) { deleteTopic(phys); cb(null, null); },
            function(cb) { deleteTopic(chem); cb(null, null); }
        ], done);
    });

    /* Before each */
    beforeEach(function(done) {
        server
            .post('/api/login')
            .send(physChemTutor)
            .expect(200)
            .expect(function(res) {
                res.body.data.should.have.property("email", physChemTutor.email);
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

                    tutorIds.indexOf(physChemTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(physTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(chemTutor._id.toString()).should.be.greaterThan(-1);
                })
                .end(done);
        });

        it('Get tutor by name', function(done){
            server
                .post('/api/get-tutors')
                .send({
                    name: physChemTutor.displayName
                })
                .expect(200)
                .expect(function (res) {
                    var tutorIds = res.body.data.map(function(tutor) {
                        return tutor._id;
                    });

                    tutorIds.indexOf(physChemTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(physTutor._id.toString()).should.equal(-1);
                    tutorIds.indexOf(chemTutor._id.toString()).should.equal(-1);
                })
                .end(done);
        });

        it('Get tutor by topicName', function(done){
            server
                .post('/api/get-tutors')
                .send({
                    topicName: phys.name
                })
                .expect(200)
                .expect(function (res) {
                    var tutorIds = res.body.data.map(function(tutor) {
                        return tutor._id;
                    });

                    tutorIds.indexOf(physChemTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(physTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(chemTutor._id.toString()).should.equal(-1);
                })
                .end(done);
        });

        it('Get tutor by name and topicName', function(done){
            server
                .post('/api/get-tutors')
                .send({
                    name: physChemTutor.displayName,
                    topicName: physTutor.topics[0].name
                })
                .expect(200)
                .expect(function (res) {
                    var tutorIds = res.body.data.map(function(tutor) {
                        return tutor._id;
                    });

                    tutorIds.indexOf(physChemTutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(physTutor._id.toString()).should.equal(-1);
                    tutorIds.indexOf(chemTutor._id.toString()).should.equal(-1);
                })
                .end(done);
        });
    });

    /* Test addTopic */
    describe('Test addTopic', function() {

        it('Add a topic', function(done) {
            server
                .post('/api/tutors/' + physChemTutor._id + '/topics')
                .send({
                    topicName: topicToAdd.name
                })
                .expect(200)
                .expect(function (res) {
                    var topic = res.body.data;

                    topic.name.should.equal(topicToAdd.name);

                    topicToAdd._id = topic._id;
                })
                .end(done);
        });

        it("Check that the topic is added to list of tutor's topics", function(done) {
            server
                .get('/api/tutors/' + physChemTutor._id + '/topics')
                .expect(200)
                .expect(function(res) {
                    var topicNames = res.body.data.map(function(topic) {
                        return topic.name;
                    });

                    topicNames.indexOf(phys.name).should.be.greaterThan(-1);
                    topicNames.indexOf(chem.name).should.be.greaterThan(-1);
                    topicNames.indexOf(topicToAdd.name).should.be.greaterThan(-1);
                })
                .end(done);
        });

        it('Remove the topic', function(done) {
            server
                .delete('/api/tutors/' + physChemTutor._id + '/topics/' + topicToAdd._id)
                .expect(200)
                .expect(function(res) {
                    var topicId = res.body.data;

                    topicId.should.equal(topicToAdd._id);
                })
                .end(done);
        });
    });

    /* Test getTopics */
    describe('Test getTopics', function() {

        it('Get all topics', function(done) {
            server
                .get('/api/tutors/' + physChemTutor._id + '/topics')
                .expect(200)
                .expect(function(res) {
                    var topicNames = res.body.data.map(function(topic) {
                        return topic.name;
                    });

                    topicNames.indexOf(phys.name).should.be.greaterThan(-1);
                    topicNames.indexOf(chem.name).should.be.greaterThan(-1);
                })
                .end(done);
        });
    });

    


});