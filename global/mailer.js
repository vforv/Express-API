var hbs = require('nodemailer-express-handlebars');
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var config = require('config');

module.exports = function (email, subject, templateName, templateVariables) {

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(
            {
                service: config.get('nodeMailer.service'),
                auth: {
                    type: 'OAuth2',
                    user: config.get('nodeMailer.from'),
                    clientId: config.get('nodeMailer.clientId'),
                    clientSecret: config.get('nodeMailer.clientSecret'),
                    refreshToken: config.get('nodeMailer.refreshToken')
                }
            }
    );

    transporter.use('compile', hbs(config.get('nodeMailer.hbs')));


// setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'no-reply@rumagesales.com',
        to: email,
        subject: subject,
        template: templateName,
        context: templateVariables
    };

// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });

};