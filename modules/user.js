var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

mongoose.model('user', new Schema({
  username : String
 ,email: String
 ,passwd : [String]
}));
