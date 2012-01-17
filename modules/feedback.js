/**
 *  Module of 分享
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _ = require('underscore');
var helper = require('./helper')

var FeedbackSchema = new Schema({
    shareset : {
        'type' : Schema.Types.ObjectId
       ,'ref' : 'shareset'
       ,'required' : true
    },
    ts : {
        type : Date,
        default : Date.now
    },
    toShareset : {
        //组织工作
        rateOrgnization: {
            type : Number
        },
        //整体满意度
        rateGeneral : {
            type : Number
        },
        //Review 建议与意见
        review : {
            type : String
        }
    },
    shares : [{
        title : String,
        authors : String,
        //分享内容满意度
        rateSubject : {
            type : Number
        },
        //分享技术满意度
        rateSkill : {
            type : Number
        },
        //分享整体满意度
        rateGeneral : {
            type : Number
        },
        //意见与建议
        review : {
            type : String
        }
    }]
});

mongoose.model('feedback', FeedbackSchema);
