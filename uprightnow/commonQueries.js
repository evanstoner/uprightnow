var reply    = require('./reply');

var packagePayload = function(key, value) {
  var payload = {};
  payload[key] = value;
  return payload;
};

exports.find = function(req, res, model, key, query) {
  query = query || {};
  model.find(query, function(err, results) {
    if (err) {
      reply.error(res, err);
    } else {
      reply.success(res, packagePayload(key, results));
    }
  });
};

exports.create = function(req, res, model, key, data) {
  var doc = new model(data);
  doc.save(function(err) {
    if (err) {
      reply.error(res, err);
    } else {
      reply.success(res, packagePayload(key, doc));
    }
  });
};

exports.update = function(req, res, model, key, id, data) {
  //TODO: handle case where document is not found
  model.findByIdAndUpdate(id, data, function(err, doc) {
    if (err) {
      reply.error(res, err);
    } else {
      reply.success(res, packagePayload(key, doc));
    }
  });
};

exports.remove = function(req, res, model, id) {
  model.findByIdAndRemove(id, function(err) {
    if (err) {
      reply.error(res, err);
    } else {
      reply.success(res);
    }
  });
};