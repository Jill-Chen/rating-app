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
 ,content : {
      'type' : String
     ,'default' : ''
  }
 ,contentHTML : {
    'type' : String
   ,'default' : ''
 }
 ,shareset : {
    type : Schema.Types.ObjectId
 }
 ,owner : {
     'type' : Schema.Types.ObjectId
 }
 ,rates : [helper.Rate]
});

ShareSchema.path('title').validate(helper.noempty,'TITLE_EMPLTY');
ShareSchema.path('authors').validate(helper.noempty,'AUTHORS_EMPTY');

mongoose.model('share', ShareSchema);
