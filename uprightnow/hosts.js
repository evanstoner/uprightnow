var mongoose = require('mongoose');
var ping     = require('net-ping');
var commonq  = require('./commonQueries');
var reply    = require('./reply');

var Host = mongoose.model('Host');

var PING_ERROR_EFFECT = -0.1;
var PING_SUCCESS_EFFECT = 0.1;

exports.findHosts = function(req, res) {
  commonq.find(req, res, Host, 'hosts');
};

exports.findHost = function(req, res) {
  commonq.find(req, res, Host, 'hosts', { _id: req.params.host_id });
};

exports.createHost = function(req, res) {
  commonq.create(req, res, Host, 'host', req.body.host);
};

exports.updateHost = function(req, res) {
  commonq.update(req, res, Host, 'hosts', req.params.host_id, req.body.host);
};

exports.ping = function(req, res) {
  Host.findById(req.params.host_id, function(err, host) {
    if (err) {
      reply.error(res, err);
    } else {
      //TODO: don't ping if another ping was done within the last second or two

      var session = ping.createSession({
        sessionId: host.address.replace(/\./g, '') % 65535,
        timeout: 1000,
        retries: 0
      });

      session.pingHost(host.address, function(err, target, sendTime, receiveTime) {
        host.score = host.score || 0;
        if (err) {
          host.score += PING_ERROR_EFFECT;
          reply.success(res, {
            error: err,
            host: host
          });
        } else {
          host.score += PING_SUCCESS_EFFECT;
          reply.success(res, {
            ping: { rtt:  receiveTime - sendTime } ,
            host: host
          });
        }

        //TODO: do we want to perform this clamping before responding?
        if (host.score < -1) {
          host.score = -1;
        } else if (host.score > 1) {
          host.score = 1;
        }

        host.save();
      });
    }
  });
};
