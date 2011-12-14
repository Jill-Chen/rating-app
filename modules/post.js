/**
 *  Module of 分享
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _ = require('underscore');
var helper = require('./helper')

var PostSchema = new Schema({
  share : {
    'type' : Schema.ObjectId,
    'ref' : 'share'
  }

 , source : {
    'type' : String
   ,'default' : ''
 }

 , cached : {
    'type' : String
   ,'default' : ''
 }
 , ts : {
    'type' : Date
   ,'default' : Date.now
 }

});

mongoose.model('post', PostSchema);
