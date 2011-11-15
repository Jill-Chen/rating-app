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
  }
  // 创建时间
 ,ts : {
    'type' : Date
   ,'default' : Date.now
 }
 ,date : {
    'type' : Date
 }
 ,startTime : {
    'type' : String
   ,'default' : ' : '
 }
 ,endTime : {
   'type' : String
   ,'default' : ' : '
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
 ,postname : {
   'type' : String,
   'required' : true
 }
 //分享会面向受众
 ,category : {
    'type' : String
 }
 //分享会
 ,deleted : {
    'type' : Boolean,
    'default' : false
 }
 ,rates : [helper.Rate]
});


mongoose.model('shareset', ShareSetSchema);
// 必须指定主题
ShareSetSchema.path('subject').validate(helper.noempty, 'SUBJECT_MISSING');
// 结束时间必须在开始时间之后
//ShareSetSchema.path('endTime').validate(function(endTime, b, c){
    //return endTime > this.startTime;
//}, 'TIME_ERROR_ENDTIME');
// 必须先登录
ShareSetSchema.path('owner').validate(helper.noempty, '请先登录');

