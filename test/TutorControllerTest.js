/**
 * Created by parkeraldricmar on 15-11-29.
 * Based on https://thewayofcode.wordpress.com/2013/04/21/how-to-build-and-test-rest-api-with-nodejs-express-mocha/
 */

var should = require('should');
var assert = require('assert');
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
        email: 'physchem@physchem.com',
        pass: '1',
        confirmPass: '1',
        userType: 'Tutor',
        charge: 0.00
    };

    var physTutor = {
        email: 'phys@phys.com',
        pass: '1',
        confirmPass: '1',
        userType: 'Tutor',
        charge: 0.00
    };

    var chemTutor = {
        email: 'chem@chem.com',
        pass: '1',
        confirmPass: '1',
        userType: 'Tutor',
        charge: 0.00
    };

    /* Test helper functions */
    function createTutor(tutorArg) {
        tutorArg.password = tutorArg.pass;
        Tutors.create(tutorArg, function(err, tutor) {
            if(err){
                should.fail(err.message);
            }
            delete tutor._doc.password;
            delete tutor._doc.__v;
            tutorArg.tutor = tutor;
            console.log(tutor);

            if (tutor) {
                console.log("yes");
            } else {
                console.log("no");
            }
        });

        Tutors.find({}).exec(function (err, tutors) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }

            if (tutors.length > 0) {
                console.log("yes");
            } else {
                console.log("no");
            }

            console.log(tutors);
        });
    }

    function deleteTutor(tutorArg) {

        // For some reason, can't remove from Tutors model.
        Users.remove({_id: tutorArg.tutor._id}, function (err) {
            if (err) {
                console.log(err.message);
            } else {
                console.log("tutor " + tutorArg.tutor._id + " Removed Successfully");
            }
        });
    }

    /* Before all */
    before(function(done) {
        createTutor(physChemTutor);
        createTutor(physTutor);
        createTutor(chemTutor);

        done();
    });

    /* After all */
    after(function(done) {

        deleteTutor(physChemTutor);
        deleteTutor(physTutor);
        deleteTutor(chemTutor);

        done();
    });

    /* Test getTutors */
    describe('Test getTutors', function() {

        it('Login', function(done) {
            server
                .post('/api/login')
                .send(physChemTutor)
                .expect(200)
                .expect(function(res) {
                    res.body.data.should.have.property("email", physChemTutor.email);
                })
                .end(done);
        });

        it('Get all tutors', function(done) {
            server
                .post('/api/get-tutors')
                .expect(200)
                .expect(function(res) {
                    var tutorIds = res.body.data.map(function(tutor) {
                        return tutor._id;
                    });

                    tutorIds.indexOf(physChemTutor.tutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(physTutor.tutor._id.toString()).should.be.greaterThan(-1);
                    tutorIds.indexOf(chemTutor.tutor._id.toString()).should.be.greaterThan(-1);
                })
                .end(done);
        });

        it('Logout', function(done) {
            server
                .post('/api/logout')
                .expect(200)
                .end(done);
        });

        //it('Get tutor by name', function(done){
        //    request(url)
        //        .post('get-tutors')
        //        .send({
        //
        //        })
        //        .expect(400)
        //        .end(function (err, res) {
        //            if (err) {
        //                throw err;
        //            }
        //
        //            res.indexOf(physChemTutor.tutor).should.be.greaterThan(-1);
        //            res.indexOf(chemTutor.tutor).should.be.greaterThan(-1);
        //            res.indexOf(physTutor.tutor).should.be.greaterThan(-1);
        //
        //            done();
        //        });
        //});

        // By topicName

        // By both name and topicName
    });

    //describe('Test getTutors', function() {
    //    it('should return error trying to save duplicate username', function(done) {
    //        var profile = {
    //            username: 'vgheri',
    //            password: 'test',
    //            firstName: 'Valerio',
    //            lastName: 'Gheri'
    //        };
    //        request(url)
    //            .post('/api/profiles')
    //            .send(profile)
    //            .end(function(err, res) {
    //                if (err) {
    //                    throw err;
    //                }
    //                // this is should.js syntax, very clear
    //                res.should.have.status(400);
    //                done();
    //            });
    //    });
    //
    //    it('should correctly update an existing account', function(done){
    //        var body = {
    //            firstName: 'JP',
    //            lastName: 'Berd'
    //        };
    //        request(url)
    //            .put('/api/profiles/vgheri')
    //            .send(body)
    //            .expect('Content-Type', /json/)
    //            .expect(200) //Status code
    //            .end(function(err,res) {
    //                if (err) {
    //                    throw err;
    //                }
    //                // Should.js fluent syntax applied
    //                res.body.should.have.property('_id');
    //                res.body.firstName.should.equal('JP');
    //                res.body.lastName.should.equal('Berd');
    //                res.body.creationDate.should.not.equal(null);
    //                done();
    //            });
    //    });
    //});
});