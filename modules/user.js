var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
mongoose.model('user', new Schema({
  login : String
 ,password : { type : String}
}));
