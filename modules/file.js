/**
 *  Module of 分享
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _ = require('underscore');
var helper = require('./helper')

var FileSchema = new Schema({
  title : {
      'type' : String
     ,'set' : helper.trim
  }

 ,type : {
    'type' : String
 }

 ,path : {
    'type' : String
 }

 ,ts_save : {
    'type' : Date
   ,'default' : Date.now
 }

 ,owner : {
     'type' : Schema.Types.ObjectId
 }
});

mongoose.model('file', FileSchema);
