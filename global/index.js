var _ = require('underscore');
var mongoose = require('mongoose');
var config = require('config');

module.exports = function (wagner) {
   var mailer = require('./mailer');
    
   return wagner.factory('Mailer', function () {
        return mailer;
    });

};