exports.error = function(res, err, code) {
  code = code || 500;
  if (res) {
    res.send(code, { error: err });
  }
};

exports.success = function(res, body, code) {
  code = code || 200;
  if (res) {
    res.send(code, body);
  }
};
