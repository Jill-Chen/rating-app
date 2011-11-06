var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

require('./share.js');
require('./shareset.js')
require('./user.js');

var db = mongoose.connect('mongodb://127.0.0.1/ratting');

var User = db.model('user');
var Share = db.model('share');
var ShareSet = db.model('shareset');

exports.User = User;
exports.Share = Share;
exports.ShareSet= ShareSet;
ShareSet.schema.path('postname').validate(function(postname, fn){
    ShareSet.findOne({postname : postname}, function(err,doc){
        if(err) return fn(false);
        if(doc){
            return fn(false);
        }
        return fn(true);
    });
    return fn;
},'POSTNAME_REPEAT');
