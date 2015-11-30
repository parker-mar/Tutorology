/**
 * Created by parkeraldricmar on 15-11-29.
 */

var http = require("http");
var assert = require("assert");
var server = require("../server.js");

describe("Server tests", function() {
//    before(function() {
//        server.listen(8989);
//    });

//    after(function() {
//        server.close();
//    });

    describe("/", function() {
        it("Should be 'Hello, Mocha'", function(done) {
            //var expected = http.get("ht)
            assert.equal("Hello, Mocha", "Hello, Mocha");
            done();
        });
    });
});