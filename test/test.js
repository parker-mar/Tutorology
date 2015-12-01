/**
 * Created by parkeraldricmar on 15-11-30.
 */

var should = require('should');
var assert = require('assert');
var async = require("async");
var mongoose = require('mongoose');
var request = require('supertest');
var server = request.agent('http://127.0.0.1:3000');
var app = require('../server.js');
var test = require('./test.js');

var Users = app.models.Users;
var Tutors = app.models.Tutors;
var Students = app.models.Students;
var Topics = app.models.Topics;
var Requests = app.models.Requests;
var Reviews = app.models.Reviews;
var Profiles = app.models.Profiles;

var toExport = {};

/* Shared Variables */
toExport.physChemTutor = {
    email: 'physchem@physchem_test.com',
    pass: '1',
    confirmPass: '1',
    displayName: 'physChemTutor',
    requests: [],
    reviews: [],
    topics: [],
    referrals: [],
    charge: 0.00
};

toExport.physTutor = {
    email: 'phys@phys_test.com',
    pass: '1',
    confirmPass: '1',
    displayName: 'physTutor',
    requests: [],
    reviews: [],
    topics: [],
    referrals: [],
    charge: 0.00
};

toExport.chemTutor = {
    email: 'chem@chem_test.com',
    pass: '1',
    confirmPass: '1',
    displayName: 'chemTutor',
    requests: [],
    reviews: [],
    topics: [],
    referrals: [],
    charge: 0.00
};

toExport.phys = {
    name: 'phys_test'
};

toExport.chem = {
    name: 'chem_test'
};

toExport.topicToAdd = {
    name: 'eng_test'
};

toExport.physChemStudent = {
    email: 'physChemStudent@physChemStudent_test.com',
    pass: '1',
    confirmPass: '1',
    displayName: 'physChemStudent',
    requests: [],
    reviews: [],
    topics: [],
    referrals: []
};

toExport.physRequest = {
    message: "Hi PhysChemTutor, I want to take Phys. Thanks. Sincerely, physChemStudent"
};

toExport.chemRequest = {
    message: "Hi PhysChemTutor, I want to take Chem. Thanks. Sincerely, physChemStudent"
};

/* Test helper functions */
toExport.createUser = function(userArg, userType) {
    var Database = Users;
    if (userType == 'Tutor') {
        Database = Tutors;
    } else if (userType == 'Student') {
        Database = Students;
    }

    userArg.password = userArg.pass;

    Database.create(userArg, function(err, user) {
        if (err) {
            should.fail(err.message);
        }
        delete user._doc.password;
        delete user._doc.__v;
        userArg._id = user._id;
    });
};

toExport.deleteUser = function(userArg, userType) {
    var Database = Users;
    if (userType == 'Tutor') {
        Database = Tutors;
    } else if (userType == 'Student') {
        Database = Students;
    }

    Database.remove({_id: userArg._id}, function (err) {
        if (err) {
            console.log(err.message);
        } else {
            console.log("User " + userArg._id + "deleted successfully");
        }
    });
};

toExport.createTutor = function(tutorArg) {
    toExport.createUser(tutorArg, 'Tutor');
};

toExport.deleteTutor = function(tutorArg) {
    toExport.deleteUser(tutorArg, 'Tutor');
};

toExport.createStudent = function(studentArg) {
    toExport.createUser(studentArg, 'Student');
};

toExport.deleteStudent = function(studentArg) {
    toExport.deleteUser(studentArg, 'Student');
};

toExport.createTopic = function(topicArg) {
    Topics.create(topicArg, function(err, topic) {
        if (err) {
            should.fail(err.message);
        }
        topicArg._id = topic._id;
    });
};

toExport.deleteTopic = function(topicArg) {
    Topics.remove({_id: topicArg._id}, function (err) {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Topic " + topicArg._id + "deleted successfully");
        }
    });
};

toExport.addTopic = function(tutorArg, topicArg) {
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
};

toExport.createRequest = function(requestArg) {
    Requests.create(requestArg, function(err, request) {
        if (err) {
            should.fail(err.message);
        }
        requestArg._id = request._id;
    });
};

toExport.deleteRequest = function(requestArg) {
    Requests.remove({_id: requestArg._id}, function (err) {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Request " + requestArg._id + " deleted successfully");
        }
    });
};

toExport.addRequest = function(studentArg, tutorArg, requestArg) {

    Students.findById(studentArg._id).exec(function (err, student) {
        if (err) {
            console.log(err.message);
            res.status(500).send({error: true, message: "An internal server error occurred."});
            return;
        }

        studentArg.requests.push(requestArg._id);

        student.requests.push(requestArg._id);

        student.save(function (err) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }
        });
    });

    Tutors.findById(tutorArg._id).exec(function (err, tutor) {
        if (err) {
            console.log(err.message);
            res.status(500).send({error: true, message: "An internal server error occurred."});
            return;
        }

        tutorArg.requests.push(requestArg._id);

        tutor.requests.push(requestArg._id);

        tutor.save(function (err) {
            if (err) {
                console.log(err.message);
                res.status(500).send({error: true, message: "An internal server error occurred."});
                return;
            }
        });
    });
};


module.exports = toExport;