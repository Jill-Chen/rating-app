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
        //话题编排和栏目设置
        rateSubject: {
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
        rateTopic: {
            type : Number
        },

        //演讲满意度
        rateTalk: {
            type : Number
        },

        //分享整体满意度
        rateTimeControl : {
            type : Number
        },
        //分享整体满意度
        rateSlider : {
            type : Number
        },
        //意见与建议
        review : {
            type : String
        }
    }]
});

mongoose.model('feedback', FeedbackSchema);
