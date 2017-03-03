var _ = require('underscore');
var mongoose = require('mongoose');
var config = require('config');

module.exports = function (wagner) {
    mongoose.connect(config.get('db'));
    
    var user = mongoose.model('User',require("./user"));
    
    var models = {
        User: user
    };
    
    _.each(models, function(value, key){
        wagner.factory(key, function(){
            return value;
        });
    });
    
    return models;

};