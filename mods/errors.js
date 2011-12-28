/**
 *  错误处理
 */
function NotFound(msg){
    this.name = 'NotFound2';
    Error.call(this,msg);
    Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;

exports.NotFound = NotFound;
