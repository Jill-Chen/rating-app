var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

mongoose.model('share', new Schema({
  title   : String
 ,ts_save : {
    type : Date,
    default : Date.now
 }
 ,authors : [String]
 ,tags : [String]
 ,desc  : String
 ,longdesc  : String
 ,ppt : String
 ,rates : [Schema.Mixed]
}));
