var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

require('./share.js');
require('./shareset.js')
require('./user.js');
require('./file.js');

var db = mongoose.connect('mongodb://127.0.0.1/ratting');

var User = db.model('user');
var Share = db.model('share');
var ShareSet = db.model('shareset');
var File = db.model('file')

exports.User = User;
exports.Share = Share;
exports.ShareSet= ShareSet;
exports.File = File;

ShareSet.schema.path('postname').validate(function(postname, fn){
    var t = this;
    ShareSet.findOne({postname : postname}, function(err,doc){
        if(err) return fn(false);
        if(doc && t._id.toString() !== doc._id.toString()){
            return fn(false);
        }
        return fn(true);
    });
    return fn;
},'POSTNAME_REPEAT');
