/**
 *  Module of 分享会
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var helper = require('./helper')


var Rate = new Schema({
    ts : {
        'type':Date
       ,'default':Date.now
    }
   ,score : {
        'type' : Number
    }
});

var ShareSetSchema = new Schema({
  // 分享主题
  subject : {
      'type'    : String
     ,'default' : ''
  }
  // 创建时间
 ,ts : {
    'type' : Date
   ,'default' : Date.now
 }
 ,startTime : {
    'type' : Date
 }
 ,endTime : {
   'type' : Date
 }
 ,position : {
   'type' : String
  ,'default' : ''
 }
  //  简介
 ,desc : {
   'type' : String
  ,'default' : ''
  }
  // 创建者
 ,owner : {
   'type' : Schema.Types.ObjectId
 }
 ,rates : [helper.Rate]
});

ShareSetSchema.path('subject').validate(helper.noempty, '主题不能为空');

mongoose.model('shareset', ShareSetSchema);
