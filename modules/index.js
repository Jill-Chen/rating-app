var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

require('./share.js');
require('./shareset.js')
require('./user.js');

var db = mongoose.connect('mongodb://127.0.0.1/ratting');

exports.User = db.model('user');
exports.Share = db.model('share');
exports.ShareSet= db.model('shareset');
