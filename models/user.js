var mongoose = require('mongoose');
var crypto = require('crypto');
var _ = require('underscore');
var config = require('config');
var jwt = require('jsonwebtoken');
var cryptoJs = require('crypto-js');


var userSchema = {
    name: {type: String, required: true},
    picture: {type: String, required: false},
    email: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    salt: {type: String, required: true},
    createDate: {type: Date, default: Date.now},
    updateDate: {type: Date, default: Date.now},
    activationCode: {type: String, required: false},
    activationDate: {type: Date, required: false},
    status: {type: String},
    deletedDate: {type: Date},
    isDeleted: {type: Boolean, default: false},
    roles: {
        type: [{
                type: String,
                enum: ['user', 'admin']
            }],
        default: ['user']
    }
};

var schema = new mongoose.Schema(userSchema);

schema.pre('save', function (next) {
    var _this = this;

    _this.updateDate = Date.now;
    _this.email = _this.email.toLowerCase();
    next();
});


schema.virtual('hash').set(function (password) {
    var _this = this;

    _this.salt = new Buffer(config.get('bcrypt.bytes')).toString('base64');
    
    //Generate random code on registration
    _this.activationCode = crypto.randomBytes(64).toString('hex');

    var hash = crypto.pbkdf2Sync(password, _this.salt, config.get('bcrypt.iterations'), config.get('bcrypt.bytes')).toString('hex');
    _this.password = hash;
});

schema.methods.toPublicJSON = function () {
    var json = this.toJSON();

    return _.pick(json, 'name', 'email', '_id', 'updateDate', 'createDate', 'picture', 'roles');
};

schema.methods.validatePassword = function (password) {
    var _this = this;

    var hash = crypto.pbkdf2Sync(password, _this.salt, config.get('bcrypt.iterations'), config.get('bcrypt.bytes')).toString('hex');
    return _this.password === hash;
};

schema.virtual('respass').set(function (password) {
    var _this = this;

    _this.activationCode = "";

    _this.salt = new Buffer(config.get('bcrypt.bytes')).toString('base64');

    var hash = crypto.pbkdf2Sync(password, _this.salt, config.get('bcrypt.iterations'), config.get('bcrypt.bytes')).toString('hex');

    _this.password = hash;
});

schema.methods.getToken = function () {
    var _this = this;

    try {
        var stringData = JSON.stringify({id: _this._id, type: config.get('jwt.type')});

        var encryptedData = cryptoJs.AES.encrypt(stringData, config.get('jwt.key')).toString();

        var token = jwt.sign({
            token: encryptedData
        }, config.get('jwt.secret'));

        return token;
    } catch (e) {
        return {"error": "Can not generate token."};
    }
};

schema.statics.findByToken = function (token) {
    return new Promise(function (resolve, reject) {
        try {
            var decodedJWT = jwt.verify(token, config.get('jwt.secret'));
            var bytes = cryptoJs.AES.decrypt(decodedJWT.token, config.get('jwt.key'));
            var tokenData = JSON.parse(bytes.toString(cryptoJs.enc.Utf8));

            mongoose.model('User').findById(tokenData.id)
                    .then(function (user) {

                        if (user) {
                            resolve(user);
                        } else {
                            reject();
                        }
                    })
                    .catch(function () {
                        reject();
                    });
        } catch (e) {
            reject();
        }
    });
};

module.exports = schema;
