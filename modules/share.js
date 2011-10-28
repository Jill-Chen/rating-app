var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _ = require('underscore');

var split = function(str){
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

        console.log('raw',raw);
        return raw;
    }
    return str;
}

mongoose.model('share', new Schema({
  title   : {
      type : String,
      default : ''
  }
 ,ts_save : {
    type : Date,
    default : Date.now
 }
 ,authors : {
     type : [String],
     set : split
 }
 ,tags : {
     type : [String],
     set : split
 }
 ,desc  : {
      type : String,
      default : ''
  }
 ,longdesc  : {
      type : String,
      default : ''
  }
 ,ppt : {
      type : String,
      default : ''
  }
 ,owner : String
 ,rates : [Schema.Mixed]
}));
