var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

require('./share.js');
require('./user.js');

mongoose.connect('mongodb://127.0.0.1/ratting');

exports.User = db.model('user');
exports.Share = db.model('share');
