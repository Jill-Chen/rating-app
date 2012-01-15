var mongoose = require('mongoose');
var _ = require('underscore');
var helper = require('./helper')
require('./user.js');
require('./file.js');
require('./post.js');

var Schema   = mongoose.Schema;

var ShareSchema = new Schema({
  title : {
      'type' : String
     ,'set' : helper.trim
     ,'required':true
  }
 ,like : {
    'type' : Number,
    'default' : 0
 }
 ,cover : {
    'type' : String
   ,'default' : '/img/default-cover.png'
  }
 ,ts_save : {
      'type' : Date
     ,'default' : Date.now
     ,'required':true
 }
 ,deleted : {
      'type' : Boolean
     ,'default' : false
 }
 ,authors : {
     'type' : [String]
     ,'required':true
 }
 ,tags : {
     'type' : [String]
    ,set : helper.split
 }
 ,desc  : {
      'type' : String
     ,'default' : ''
  }
  //markdown
 ,content : {
      'type' : String
     ,'default' : ''
  }
  //parsed markdown
 ,contentHTML : {
      'type' : String
     ,'default' : ''
 }
 ,owner : {
      'type' : Schema.Types.ObjectId
     ,'required':true
 }
 ,viewCount : {
    'type' : Number
   ,'default' : 0
 }

});

var ShareSetSchema = new Schema({
  // 本期主题
  subject : {
      'type'    : String
     ,'required' : true
  },
  //分享会名称
  name : {
    'type' : String
   ,'required' : true
   ,'default' : ''
  }
  // 创建时间
 ,ts : {
    'type' : Date
   ,'default' : Date.now
 }
 ,date : {
    'type' : Date
   ,'required' : true
 }
 ,startTime : {
    'type' : String
   ,'default' : ''
   ,'validate' : [/^\d{1,2}\:\d{1,2}$/,'需要设置时间']
   ,'required' : true
 }
 ,endTime : {
   'type' : String
   ,'default' : ''
   ,'validate' : [/^\d{1,2}\:\d{1,2}$/,'需要设置时间']
   ,'required' : true
 }
 ,position : {
    'type' : String
   ,'default' : ''
   ,'required' : true
 }
  //  简介
 ,desc : {
   'type' : String
  ,'default' : ''
  }
  // 创建者
 ,owner : {
    'type' : Schema.Types.ObjectId
   ,'ref' : 'user'
   ,'required' : true
 }
 //分享会url shortname
 ,postname : {
   'type' : String,
   'required' : true,
   'validate' : [/^[0-9a-zA-Z\_\-]+$/, '个性地址只能包含字母，数字，- 或"_']
 }
 //分享会类别
 ,category : {
    'type' : String
 }
 //标记
 ,deleted : {
    'type' : Boolean,
    'default' : false
 }
 ,shares : [ { type: Schema.ObjectId, ref: 'share' } ]
});


mongoose.model('shareset', ShareSetSchema);
mongoose.model('share', ShareSchema);

//ShareSetSchema.path('postname').validate(/^[0-9a-zA-Z\_\-]+$/, '个性地址只能包含字母，数字，- 或"_');

var db = mongoose.connect('mongodb://127.0.0.1/ratting');
exports.User = db.model('user');;
exports.Share = db.model('share');;
exports.ShareSet= db.model('shareset');;
exports.File = db.model('file');;
exports.Post = db.model('post');;
