/**
 *  Module of 分享会
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var helper = require('./helper')
var User = require('./user');


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
     ,'required' : true
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
   'required' : true
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
 ,rates : [helper.Rate]
});


mongoose.model('shareset', ShareSetSchema);
// 结束时间必须在开始时间之后
//ShareSetSchema.path('endTime').validate(function(endTime, b, c){
    //return endTime > this.startTime;
//}, 'TIME_ERROR_ENDTIME');
// 必须先登录
ShareSetSchema.path('postname').validate(/^[0-9a-zA-Z\_\-]+$/, '个性地址只能包含字母，数字，- 或"_');
