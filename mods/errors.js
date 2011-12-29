/**
 *  错误处理
 */
function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this,msg);
    Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;
NotFound.prototype.statusCode = 400;

exports.NotFound = NotFound;
