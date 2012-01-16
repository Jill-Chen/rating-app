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
        //时间控制
        rateTimeControl : {
            type : Number
        },
        // 主持人
        rateHost : {

        },
        //话题满意度
        rateSubject : {
            type : Number
        },
        //Review 建议
        review : {
            type : String
        }
    },
    toShares : [{
        title : {
            type : String
        },
        share : {
            type : Schema.Types.ObjectId
        },
        speaker : {
            type : String
        },
        rateScore : {
            type : Number
        },
        review : {
            type : String
        }
    }]
});

mongoose.model('feedback', FeedbackSchema);
