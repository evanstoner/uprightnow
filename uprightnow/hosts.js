var mongoose = require('mongoose');
var ping     = require('net-ping');
var commonq  = require('./commonQueries');
var reply    = require('./reply');
var config   = require('../config');

var Host = mongoose.model('Host');

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

exports.pingAll = function(req, res) {

};

exports.pingOne = function(req, res) {
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
        host.history = host.history || [];
        var historyPoint = { time: new Date() };
        if (err) {
          historyPoint.error = err;
          if (config.DEBUG) console.log('- ' + host.name + '(' + host.address + '): ' + err);
        } else {
          historyPoint.rtt = receiveTime - sendTime;
          if (config.DEBUG) console.log('+ ' + host.name + '(' + host.address + '): ' + historyPoint.rtt);
        }

        host.history.push(historyPoint);
        while (host.history.length > config.HISTORY_LIMIT) {
          host.history.shift();
          host.markModified('history');
        }
        
        reply.success(res, {
          host: host
        });

        host.save();
      });
    }
  });
};
