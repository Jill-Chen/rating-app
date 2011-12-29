/**
 *  错误
 */
var NotFound = exports.NotFound = function(msg){
    this.name = 'NotFound';
    Error.call(this,msg);
    Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;
NotFound.prototype.statusCode = 400;

/*
 * 权限不足
 */
var NoPermission = exports.NoPermission =  function(msg){
    this.name = 'NoPermission';
    Error.call(this,msg);
    Error.captureStackTrace(this, arguments.callee);
}
NoPermission.prototype.__proto__ = Error.prototype;
NoPermission.prototype.status = 401;
