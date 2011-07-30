var _ = require("underscore");

var encode = function(v){
    if(_.isArray(v)){
        return _.map(v,function(vi){
            return encode(vi)
        });
    }else if(_.isString(v)){
        return encodeURIComponent(v)
    }
};
var decode = function(v){
    if(_.isArray(v)){
        return _.map(v,function(vi){
            return decode(vi)
        });
    }else if(_.isString(v)){
        return decodeURIComponent(v);
    }else{
        return v;
    }
};
exports.encode = encode;
exports.decode = decode;
