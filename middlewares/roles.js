var status = require('http-status');

module.exports = function (User) {
    return {
        admin: function (req, res, next) {

            User.findOne({
                _id: req.user._id,
                roles: 'admin'

            }, function (err, user) {
                if (user) {
                    next();
                } else {
                    return res
                            .status(status.UNAUTHORIZED)
                            .json({"error": "Do not have access."})
                }

            });

        },
        user: function (req, res, next) {

            User.findOne({
                _id: req.user._id,
                roles: 'user'

            }, function (err, user) {
                if (user) {
                    next();
                } else {
                    return res
                            .status(status.UNAUTHORIZED)
                            .json({"error": "Do not have access."})
                }

            });

        }
    }
};