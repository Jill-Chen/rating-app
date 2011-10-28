/**
 * Module dependencies.
 */

var express = require('express');


//var QRcode = require('qrcode');
var _ = require("underscore");
var apptitle = '火鸟打分系统';
var average = require('./modules/average').average;
var modules = require('./modules/');
var everyauth = require('everyauth');
var sechash  = require('sechash');
//everyauth.debug = true;

var app = module.exports = express.createServer(); // Configuration
var Share = modules.Share;
var User = modules.User;

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
        console.log(newUser, errors);
        var promise = this.Promise();

        var user = User.findOne({ login : newUser.login}, function(err, user){
            console.log(err,user);
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
        var promise = this.Promise();
        newUser.password = sechash.basicHash('md5',newUser.password)
        var user = new User(newUser);
        user.save(function(err,doc){
            if(err)
                errors.push(err);
            promise.fulfill(errors);
            return doc;
        });

        return promise;
    })
    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/')

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret:"Share, Share"}));
  app.use(everyauth.middleware());
  app.use(express.methodOverride());
  app.use(app.router);

  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    console.log('development');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    console.log('production');
    app.use(express.errorHandler());
    app.set("view cache", true);
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: '首页'
  });
});

app.get('/tags', function(req, res){
    Share.distinct('tags',{}, function(err, docs){
        res.render('tags', {
            title : '标签',
            tags : docs
        });
    });
});

app.get('/json/tags', function(req, res){
    Share.distinct('tags',{}, function(err, docs){
        res.send({
            isSuccess : true,
            tags : docs
        });
    });
});

app.get('/create',function(req,res){
    var share = new Share();
    res.render('create', {
        title: 'Create a Cate',
        error : [],
        share : share
    });
});

/**
 * create a share
 */
app.post('/create',function(req,res){
    var share = new Share({
            title : req.body['share.title'],
            authors : req.body['share.authors'],
            tags : req.body['share.tags'],
            desc : req.body['share.desc']
        }),
        error = [];

    console.log('post create', share);
    if(share.authors.length === 0){
        error.push("请输入 分享者");
    }

    if(!share.title){
        error.push("请输入 分享标题");
    }

    if(error.length > 0){
        res.render('create', {
            title: 'Create a Cate',
            error : error,
            share : share
        });
        return;
    }

    share.save(function(err,share){
        res.redirect('/create-ok/' + share._id);
    });
});

app.get('/create-ok/:id',function(req,res){
    res.render('create-ok', {
        title: 'Create a Cate',
        id : req.params.id
    });
});


//show a rate
app.get('/show/:rid', function(req, res){
    var rateid = req.params.rid;
    var result = {};
    Share.findById(rateid, function(err,doc){
        if(doc) {
            _(doc.rates).each(function(item){
                item.tdate = new Date(item.ts);
                _(['rate1','rate2','rate3','rate4']).each(function(idx){
                    item[idx] = Math.round(item[idx]*10)/10;
                });
            });
            res.render('showrate', {
                title : doc.title,
                doc : doc,
                rates : doc.rates
            });

        }else{
            res.redirect('/list');
        }
    });
});

//** jsonp
app.get('/getrate/:rid', function(req, res){
    var rid = req.params.rid;
    var query = {'_id' : BSON.ObjectID(rid)};
    var result = {};

    Share.findOne(query, function(err,doc){
            var json;
            if(doc) {
                json = JSON.stringify(doc);
                res.header('Content-Type', 'data/plain');
                res.header('Content-Disposition','attachment; filename='+doc.title+'.json');
                res.send(json);
            }

    });
});

//list the rates
app.get('/list/:query?',function(req,res){
    var query = {},
        author = req.param("author", ""),
        title = req.param("title", ""),
        tag = req.param("tag", "");


    if(author.length > 0){
        query.authors = author;
    }

    if(title.length > 0){
        query.title = title;
    }

    if(tag.length > 0){
        query.tags = tag;
    }

    Share.find(
        query,
        function(err, docs){
            docs.forEach(function(doc){
                doc.score = average(doc.rates);
            });


            res.render('list', {
                result : docs,
                query : query,
                title : '所有分享',
            });
        }
    );
});

app.post("/ratedo", function(req, res){
    var id = req.param("rid");
    var rate1 = Number(req.param("rate1"));
    var rate2 = Number(req.param("rate2"));
    var rate3 = Number(req.param("rate3"));
    var rate4 = Number(req.param("rate4"));

    if(isNaN(rate1) || isNaN(rate2) || isNaN(rate3) || isNaN(rate4)) {
        res.redirect("/rate/"+id);
        return;
    }

    var ratedata = {
        rate1 : rate1,
        rate2 : rate2,
        rate3 : rate3,
        rate4 : rate4,
        ts : new Date().getTime()
    };

    Share.update({
        _id : id
    },{
        $push : {
            rates : ratedata
        }
    }, function(err, data){
        res.redirect("/show/"+id);
    });
});

app.error(function(err, req, res){
    res.render('500', {
        error : err
    });
});

app.get('/qrcode2',function(req,res){
    res.send('');
    return;
    var url = req.param('url');
    QRcode.toDataURL(url,function(err, data){
        res.send({
            isSuccess : true,
            dataURL : data
        });
    });
});

app.get('/rate/:rid',function(req,res){
    var rateid = req.params.rid;

    Share.findById(rateid, function(err, doc){
        res.render('rate2',{
            doc : doc,
            title :'rate',
            css : 'rate'
        });
    });
});

_(require('./routers/')).each(function(pack,packname){

    _(pack).each(function(fn, key){
        console.log(packname, key);
        app.get('/'+packname+'/' + key, fn);
    });

});

everyauth.helpExpress(app);
exports.app = app;
