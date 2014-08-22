var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');

mongoose.connect('mongodb://localhost/uprightnow');
//TODO: verify successful connection

// create models
var schemas = require('./uprightnow/schemas');
mongoose.model('Host', schemas.Host);

// load resources
var hosts    = require('./uprightnow/hosts');

var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));




var router = express.Router();

// middleware not yet implemented
router.use(function(req, res, next) {
  next();
});

router.route('/')
  .get(function(req, res) {
    res.send('uprightnow is running');
  });


// hosts
router.route('/hosts')
  .get(hosts.findHosts)
  .post(hosts.createHost);

router.route('/hosts/ping')
  .get(hosts.pingAll);

router.route('/hosts/:host_id')
  .get(hosts.findHost)
  .put(hosts.updateHost);

router.route('/hosts/:host_id/ping')
  .get(hosts.pingOne);


app.use('/uprightnow', router);




var port = process.env.PORT || 8760;
app.listen(port);
console.log('uprightnow running at :' + port + '/uprightnow');
