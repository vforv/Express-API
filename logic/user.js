var _ = require('underscore');
var status = require('http-status');
var wagner = require('wagner-core');
var config = require('config');
var crypto = require('crypto');
var module;

function userLogic() {
}

/**
 * @api {post} /login Login user
 * @apiName PostLoginUser
 * @apiGroup User
 
 * @apiParam {email} email Users email address
 * @apiParam {String} password Users password
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *         "name": "Vladimir Djukic",
 *         "email": "vladimir@amerbank.com",
 *         "_id": "589c5c6f2ac66d50bc7b7d5d",
 *         "updateDate": "2017-02-09T12:11:27.541Z",
 *         "createDate": "2017-02-09T12:11:27.541Z",
 *         "roles": [
 *           "user"
 *         ]
 *       },
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IlUyRnNkR1ZrWDErVGk2dWJWZTBmZXMyRDB1SDRwVm5nOWFyNGFVcldSNEsrRUhocjRUSlg4RHZhc25mRGV5SUlYTVlxYWIyUjZxODQxa0piZ2x6UnFPK0Q5V1RMZEhkZ3dOT2lUSUpLSm1rPSIsImlhdCI6MTQ4NjY0MzA0MX0.Ryts412ZQc1WJJp0_t7Q8vwpeEYgSPbQYWuSjVwR3tU"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *      {
 *       "error": "Please activate your account."
 *      }
 *
 * 
 */
userLogic.prototype.postLoginAction = function (req, res) {

    wagner.invoke(function (User) {
        var body = _.pick(req.body, 'email', 'password');

        User.findOne({
            email: body.email
        })
                .then(function (user) {

                    if (user && user !== null && user.validatePassword(body.password)) {

                        return res.status(status.OK)
                                .json({"user": user.toPublicJSON(), "token": user.getToken()});
                    }
                    ;
                    return res.status(status.UNAUTHORIZED)
                            .json({"error": "Wrong email or password."});
                })
                .catch(function (err) {
                    return res.status(status.UNAUTHORIZED)
                            .json({"error": "Wrong email or password."});
                });
    });

};


/**
 * @api {post} /register Register user
 * @apiName PostRegisterUser
 * @apiGroup User
 *
 * @apiParam {String} name Users full name
 * @apiParam {String} email Users email address
 * @apiParam {String} password Users password
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Vladimir Djukic",
 *       "email": "vladimir@amerbank.com",
 *       "_id": "589c58f134e05a4e6c49ca5a",
 *       "updateDate": "2017-02-09T11:56:33.255Z",
 *       "createDate": "2017-02-09T11:56:33.254Z",
 *       "roles": [
 *         "user"
 *       ]
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *      {
 *       "error": "This platform is currently just for internal use."
 *      }
 *
 * 
 */
userLogic.prototype.postRegisterAction = function (req, res) {

    wagner.invoke(function (User, Mailer) {
        var body = _.pick(req.body, 'name', 'email', 'password');

        User.create({
            name: body.name,
            email: body.email,
            hash: body.password
        })
                .then(function (user) {

                    link = config.get('client.dashboard') + "code/" + user.activationCode;

                    var templateVariables = {
                        name: user.name,
                        link: link,
                        username: user.email,
                        password: body.password
                    };

                    Mailer(user.email, 'Welcome to RS platform, ' + user.name + '! Please confirm your email address', 'activation', templateVariables);

                    return res.send(user.toPublicJSON());
                }, function (err) {
                    if (err.code === 11000) {
                        return res
                                .status(status.BAD_REQUEST)
                                .json({"error": "This email already exists."});
                    }

                    return res
                            .status(status.INTERNAL_SERVER_ERROR)
                            .json({"error": "Internal server error."});
                });
    });

};

/**
 * @api {get} /code/:code Activate account
 * @apiName GetActivateUser
 * @apiGroup User
 *
 * @apiParam {String} code Activation code from email
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "user": {
 *          "name": "Vladimir Djukic",
 *          "email": "vladimir@amerbank.com",
 *          "_id": "589c5c6f2ac66d50bc7b7d5d",
 *          "updateDate": "2017-02-09T12:11:27.541Z",
 *          "createDate": "2017-02-09T12:11:27.541Z",
 *          "roles": [
 *              "user"
 *          ]
 *       },
 *      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IlUyRnNkR1ZrWDErMlczSHVTMlBZOFkvUDU4Umd4cDI4UnQyY0lJZzJ4V00xV0lvSUwvbXd0eXAxc0NIUmx1QnZ1NHYxRHY4dStNcktJb0l5NGpRMlJiUkZudFFaTElVSWwwYVdicU9FVU80PSIsImlhdCI6MTQ4NjY0MjM2N30.-dAp5Vj9ehyKg_9n4RJZ8RD-616sGdAwQRl48XfULbw"
 *    }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *      {
 *       "error":"Wrong code"
 *      }
 *
 * 
 */
userLogic.prototype.getActivationAction = function (req, res) {

    wagner.invoke(function (User) {
        User.findOne({activationCode: req.params.code}, function (err, user) {
            if (err) {
                return res
                        .status(status.INTERNAL_SERVER_ERROR)
                        .json({"error": "Internal server error."});
            } else {

                if (!user) {
                    return res
                            .status(status.UNAUTHORIZED)
                            .json({"error": "Wrong code"});
                }

                user.status = 1;
                user.activationCode = '';
                user.save(function (err) {
                    if (err) {
                        return res
                                .status(status.INTERNAL_SERVER_ERROR)
                                .json({"error": "Internal server error."});
                    }

                    return res.status(status.OK)
                            .json({"user": user.toPublicJSON(), "token": user.getToken()});
                });
            }
        });
    });

};


/**
 * @api {post} /forgot Forgot password
 * @apiName PostForgotPasswordUser
 * @apiGroup User
 
 * @apiParam {email} email Users email address
 * 
 * @apiDescription After submit user will get link on mail wich can use to reset password
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": "Link sent to: vladimir@amerbank.com"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *      {
 *        error: "Email not exists"
 *      }
 *
 * 
 */
userLogic.prototype.postForgotAction = function (req, res) {

    wagner.invoke(function (User, Mailer) {

        User.findOne({email: req.body.email}, function (err, user) {
            if (err) {
                res.status(status.INTERNAL_SERVER_ERROR)
                        .json({error: err});
            }

            if (!user) {
                res.status(status.NOT_FOUND)
                        .json({error: "Email not exists"});
            } else {
                var code = crypto.randomBytes(64).toString('hex');
                user.activationCode = code;

                user.save(function (err) {
                    if (err) {
                        res.status(status.INTERNAL_SERVER_ERROR)
                                .json({error: err});
                    }

                    link = config.get('client.dashboard') + "recover/" + code;

                    var templateVariables = {
                        name: user.name,
                        link: link
                    };

                    Mailer(user.email, 'Dear, ' + user.name + '! We sent you reset link', 'reset', templateVariables);

                    res.
                            json({data: "Link sent to: " + user.email});
                });
            }


        });

    });

};

/**
 * @api {post} /recover Recover password
 * @apiName PostRecoverPasswordUser
 * @apiGroup User
 
 * @apiParam {String} code Code wich recived on mail
 * @apiParam {String} password New password
 * 
 * @apiDescription Send code and new password to reset passwrod
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": "Password changed!"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *      {
 *        error: "Unable to reset password"
 *      }
 *
 * 
 */
userLogic.prototype.postRecoverAction = function (req, res) {

    wagner.invoke(function (User) {
        User.findOne({activationCode: req.body.code}, function (err, user) {
            if (err) {
                res.status(status.INTERNAL_SERVER_ERROR)
                        .json({error: err});

            } else {
                if (!user) {
                    res.status(status.NOT_FOUND)
                            .json({error: "Unable to reset password"});
                } else {
                    user.respass = req.body.password;

                    user.save(function (err) {
                        if (err) {
                            res.status(status.INTERNAL_SERVER_ERROR)
                                    .json({error: err});
                        } else {
                            return res
                                    .json({data: "Password changed!"});
                        }
                    });
                }
            }




        });
    });

};


module.exports = new userLogic();