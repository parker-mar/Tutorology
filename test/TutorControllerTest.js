/**
 * Created by parkeraldricmar on 15-11-29.
 * Based on https://thewayofcode.wordpress.com/2013/04/21/how-to-build-and-test-rest-api-with-nodejs-express-mocha/
 */

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
app = require('../server.js');

var Tutors = app.models.Tutors;
var Topics = app.models.Topics;
var Requests = app.models.Requests;
var Reviews = app.models.Reviews;
var Profiles = app.models.Profiles;

describe('Tutor Controller Test', function() {

    var url = 'http://127.0.0.1:3000/';

    var physChemTutor = {
        email: 'physchem@physchem.com',
        pass: 'physchem',
        confirmPass: 'physchem',
        userType: 'Tutor',
        charge: 0.00
    };

    var physTutor = {
        email: 'phys@phys.com',
        pass: 'phys',
        confirmPass: 'phys',
        userType: 'Tutor',
        charge: 0.00
    };

    var chemTutor = {
        email: 'chem@chem.com',
        pass: 'chem',
        confirmPass: 'chem',
        userType: 'Tutor',
        charge: 0.00
    };

    function createTutor(tutorArg) {
        Tutors.create(tutorArg, function(err, tutor) {
            if(err){
                should.fail(err.message);
            }
            delete tutor._doc.password;
            delete tutor._doc.__v;
            tutorArg.tutor = tutor;
        });
    }

    function deleteTutor(tutorArg) {
        Profiles.remove({_id: tutorArg.tutor.profile._id}, function (err) {
            if (err) {
                console.log(err.message);
            } else {
                Tutors.remove({_id: tutorArg.tutor._id}, function (err) {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log("tutor " + tutorArg.tutor._id + " Removed Successfully");
                    }
                });
            }
        });
    }

    before(function(done) {
        mongoose.connect('mongodb://localhost/bazahmed', {
            user: '',
            pass: ''
        });

        createTutor(physChemTutor);
        createTutor(physTutor);
        createTutor(chemTutor);

        done();
    });

    after(function(done) {
        mongoose.disconnect();

        deleteTutor(physChemTutor);
        deleteTutor(physTutor);
        deleteTutor(chemTutor);

        done();
    });

    describe('Test getTutors', function() {
        it('Get all tutors (empty query)', function(done){
            request(url)
                .post('get-tutors')
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.indexOf(physChemTutor.tutor).should.be.greaterThan(-1);
                    res.indexOf(chemTutor.tutor).should.be.greaterThan(-1);
                    res.indexOf(physTutor.tutor).should.be.greaterThan(-1);

                    done();
                });
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