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
     ,'set' : helper.trim
  }
 ,cover : {
    'type' : String
   ,'default' : '/img/default-cover.png'
  }
 ,ts_save : {
    'type' : Date
   ,'default' : Date.now
 }
 ,deleted : {
    'type' : Boolean,
    'default' : false
 }
 ,authors : {
     'type' : [String]
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

ShareSchema.path('title').validate(helper.noempty,'TITLE_EMPLTY');
ShareSchema.path('authors').validate(helper.noempty,'AUTHORS_EMPTY');

mongoose.model('share', ShareSchema);
