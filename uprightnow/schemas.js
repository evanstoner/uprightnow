var mongoose = require('mongoose');

var Schema   = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed    = Schema.Types.Mixed;

var Host = new Schema({
  name:    String,
  address: { type: String, required: true }, //TODO: Host.address validation
  score:   { type: Number, min: -1, max: 1, default: 0 },
});

exports.Host = Host;
