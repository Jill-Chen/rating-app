/**
 *  Module of 分享
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _ = require('underscore');
var helper = require('./helper')



var ShareSchema = new Schema({
  title : {
      'type' : String
     ,'default' : ''
     ,'set' : helper.trim
  }
 ,ts_save : {
    'type' : Date
   ,'default' : Date.now
 }
 ,authors : {
     'type' : [String]
    ,'default':['']
 }
 ,tags : {
     'type' : [String]
    ,set : helper.split
 }
 ,desc  : {
      'type' : String
     ,'default' : ''
  }
 ,longdesc  : {
      'type' : String
     ,'default' : ''
  }
 ,shareset : {
    type : Schema.Types.ObjectId
 }
  /**
   * {
   *    slideshare : '9999999',
   *    file : 'xxx',
   *    url : 'xxx'
   * }
   */
 ,slider : {
     slideshare : String
    ,file : String
    ,url : String
  }
 ,owner : {
     'type' : Schema.Types.ObjectId
 }
 ,rates : [helper.Rate]
});

ShareSchema.path('title').validate(helper.noempty,'分享标题不能为空');
ShareSchema.path('authors').validate(helper.noempty,'分享者不能为空');

mongoose.model('share', ShareSchema);