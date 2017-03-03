var express = require('express');
var bodyParser = require('body-parser');
var user = require('./logic/user');


/**
 * 
 * Routes /api/v*
 * 
 * @param {obj} wagner
 * @returns {obj}
 */
module.exports = function (wagner)
{
    var UserModal = wagner.invoke(function (User) {
        return User;
    });

    var auth = require('./middlewares/auth')(UserModal);
    var roles = require('./middlewares/roles')(UserModal);
    var route = express.Router();
    route.use(bodyParser.json());
    route.use(bodyParser.urlencoded({extended: true}));





    //GUEST USERS
    route.post('/register', user.postRegisterAction);
    route.post('/login', user.postLoginAction);
    route.get('/code/:code', user.getActivationAction);
    route.post('/recover', user.postRecoverAction);
    route.post('/forgot', user.postForgotAction);


    //AUTHENTICATED USERS
    route.use(auth.authenticated);

    route.get('/test', roles.admin, function (req, res) {
        res.send('Hello World');
    });

    route.get('/profile', function (req, res) {
        res.json(req.user);
    });

    return route;
};