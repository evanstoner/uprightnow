var mongoose = require('mongoose');

var Schema   = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed    = Schema.Types.Mixed;

var Host = new Schema({
  name:    String,
  address: { type: String, required: true }, //TODO: Host.address validation
  history: [{
    time:  { type: Date, required: true },
    error: Mixed,
    rtt:   Number
  }]
});

exports.Host = Host;
