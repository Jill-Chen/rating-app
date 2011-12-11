var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var UserSchema = exports.Schema =  new Schema({
  email : String
 ,password : { type : String}
 ,name : {
    type : String
   ,'default' : ''
 }
})

mongoose.model('user', UserSchema);
