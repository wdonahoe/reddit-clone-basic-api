var logger          = require('morgan');
var cors            = require('cors');
var http            = require('http');
var express         = require('express');
var cors            = require('cors');
var dotenv          = require('dotenv');
var bodyParser      = require('body-parser');
var mongoose        = require('mongoose');
var log             = require('./log')(module);
var config          = require('./config');
var methodOverride  = require('method-override');

var app             = express();

/*dotenv.load();*/

// Parsers
// old version of line
// app.use(bodyParser.urlencoded());
// new version of line
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

app.use('/api',require('./routes'));
app.use('*', function(req,res){res.send(404).end()});

// connect to the database.
var connectionUrl = app.get('env') === 'development' ? config.mongoose.dev : config.mongoose.production
mongoose.connect(connectionUrl);
var db = mongoose.connection;

db.once('open',function(open){
    log.info('connected to ' + db.name + ' on ' + db.host + ' on port ' + db.port);
});
db.on('error',function(err){
    log.error(err);
});

// error handlers
app.use(function(req, res, next){
    res.status(404);
    log.debug('Not found URL: %s',req.url);
    res.send({ error: 'Not found' });
    return;
});

app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
    return;
});

//app.use('/api',require('./protected-routes'));
//app.use('/api',require('./user-routes'));

var port = process.env.PORT || config.port;

http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});

