var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var db       = mongoose.connect('mongodb://127.0.0.1/ratting');
var _        = require('underscore');

mongoose.model('share', new Schema({
  title   : String
 ,ts_save : {
    type : Date,
    default : Date.now
 }
 ,authors : [String]
 ,tags : [String]
 ,desc  : String
 ,longdesc  : String
 ,ppt : String
 ,rates : [Schema.Mixed]
}));

var Share = db.model('share');

exports.Share = Share;
