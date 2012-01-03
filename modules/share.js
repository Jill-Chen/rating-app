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
 ,shareset : {
      type : Schema.Types.ObjectId
     ,'required':true
 }
 ,owner : {
      'type' : Schema.Types.ObjectId
     ,'required':true
 }
 ,viewCount : {
    'type' : Number
   ,'default' : 0
 }
 ,rates : [helper.Rate]
});

mongoose.model('share', ShareSchema);
