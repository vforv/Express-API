var assert = require("assert");
var express = require("express");
var superagent = require("superagent");
var URL_ROOT = "http://localhost:3000";
var wagner = require("wagner-core");

describe('Test User', function () {
    var app = express();
    var User;

    before(function () {
        models = require('../models')(wagner);
        app.use(require('../routes')(wagner));

        User = models.User;

        var testUser = {
            name: 'Vladimir',
            email: 'vladimir@test.com',
            hash: 'test123'
        };

        User.create(testUser, function(error, user) {
            
        });



        server = app.listen(3000);

    });

    after(function () {
        User.remove({}, function (error) {
            assert.ifError(error);
        });

        server.close();
    });

   

    it('Create new user', function (done) {
        url = URL_ROOT + '/register';
        superagent.post(url)
                .send({
                    name: 'Vladimir',
                    email: 'vladimir@gmail.com',
                    password: 'test123',
                    role: ['admin', 'user']
                })
                .end(function (err, res) {
                    assert.ifError(err);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);
                    });
                    
                    
                    assert.equal(result.name, 'Vladimir');
                    done();
                });
    });

    it('Login user', function (done) {
        url = URL_ROOT + '/login';
        superagent.post(url)
                .send({
                   email: 'vladimir@test.com',
                   password: 'test123' 
                })
                .end(function (err, res) {
                    assert.ifError(err);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);
                    });

                    assert.equal(result.user.email, 'vladimir@test.com');
                    done();
                });
    });

});
