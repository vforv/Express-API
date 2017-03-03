var FileStreamRotator = require('file-stream-rotator');
var express = require("express");
var wagner = require("wagner-core");
var config = require("config");
var helmet = require('helmet');
var cors = require('cors');
var fs = require('fs');
var morgan = require('morgan');
var path = require('path');
var PORT = process.env.PORT || 3000;




var app = express();

/**
 * 
 * LOGGING...
 * 
 * @type log dir
 */
var logDirectory = __dirname + '/log';

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});
 
app.use(morgan('combined', {stream: accessLogStream}));

/**
 * SECURTY
 */
app.use(cors());
app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.5.0' }));

/**
 * API DOCUMENTATION
 */
app.use('/doc', express.static(path.join(__dirname, 'views/doc')));

/**
 * APP STAFF
 */
require('./global')(wagner);
require('./models')(wagner);
app.use(config.get('version'), require('./routes')(wagner));

app.listen(PORT, function() {
    console.log("Server started");
});