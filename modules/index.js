var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

require('./share.js');
require('./shareset.js')
require('./user.js');
require('./file.js');
require('./post.js');

var db = mongoose.connect('mongodb://127.0.0.1/ratting');

exports.User = db.model('user');;
exports.Share = db.model('share');;
exports.ShareSet= db.model('shareset');;
exports.File = db.model('file');;
exports.Post = db.model('post');;

//ensure postname is uniq

exports.ShareSet.schema.path('postname').validate(
    function(postname, fn){
    var t = this;
    exports.ShareSet.findOne({
        postname : postname
    }, function(err,doc){
        if(err) return fn(false);
        if(doc && t._id.toString() !== doc._id.toString()){
            return fn(false);
        }
        return fn(true);
    });
    return fn;
}, 'POSTNAME_REPEAT');
