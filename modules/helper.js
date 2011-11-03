var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _ = require('underscore');
var dateFormat = require('dateformat');

exports.trim = function(v){
    return v.trim();
}

exports.dateformat = function(v){
    console.log('dataformat',v,typeof v);
    return dateFormat(v, "yyyy-mm-dd HH:MM:ss");
}

exports.noempty = function(v){
    if(_.isArray(v)){
        v = _.compact(v);
    }
    return !_.isEmpty(v);
}
/**
 * parse the tagstring
 * @param {String} str raw string from form input
 * @return {Array} array of tags
 */
exports.split = function(str){
    var raw;
    if(str.length === 1){
        raw = str[0].trim().replace(/ +/g,",").replace(/，/g, ",").replace(/,+/g,",").split(",");
        raw = _(raw).chain()
            .map(function(tag){
                return tag.trim();
            })
            .without('')
            .uniq()
            .value()
        return raw;
    }
    return str;
};

exports.Rate = new Schema({
    ts : {
        'type':Date
       ,'default':Date.now
    }
   ,score : {
        'type' : Number
    }
});
