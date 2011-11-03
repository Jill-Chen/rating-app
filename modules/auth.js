var everyauth = require('everyauth');
var sechash  = require('sechash');
var User = require('./index').User;


exports.everyauth = everyauth;

//everyauth.debug = true;
everyauth.everymodule.findUserById(function(userId, callback){
    User.findById(userId, callback);
});
everyauth.password
    .loginWith('login')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login')
    .loginLocals({
        layout : 'layout-auth',
        title : ' 登录'
    })
    .authenticate(function(login, password){
        var promise = this.Promise();
        User.findOne({login:login}, function(err, user){
            if(err){
                return promise.fulfill([err])
            }
            if(!user){
                return promise.fulfill(['用户名和密码错误'])
            }
            if(sechash.testBasicHash('md5',password, user.password)){
                return promise.fulfill(user);
            }else{
                return promise.fulfill(['password not match']);
            }
        });
        return promise;
    })
    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register')
    .registerLocals({
        layout : 'layout-auth',
        title : '注册'
    })
    .validateRegistration(function(newUser, errors){
        console.log('validate', newUser, errors);
        var promise = this.Promise();

        var user = User.findOne({ login : newUser.login}, function(err, user){
            if(err){
                errors.push(err)
                promise.fulfill(errors);
                return;
            }
            if(user){
                errors.push("用户已经存在")
                promise.fulfill(errors);
                return;
            }
            promise.fulfill(errors);
        });
        return promise;
    })
    .registerUser(function(newUser, errors){
        console.log('newUser', newUser, errors);
        var promise = this.Promise();
        newUser.password = sechash.basicHash('md5',newUser.password)
        var user = new User(newUser);
        user.save(function(err,doc){
            if(err){
                errors.push(err);
                promise.fulfill([errors]);
            }
            promise.fulfill(user);
        });

        return promise;
    })
    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/')
