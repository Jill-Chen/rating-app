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
var RedisStore = require('connect-redis')(express);
var dateFormat = require('dateformat');
//everyauth.debug = true;

var app = module.exports = express.createServer(); // Configuration
var Share = modules.Share;
var User = modules.User;
var ShareSet = modules.ShareSet;

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

function checkauth(req,res,next){
    if(!req.loggedIn){
        res.redirect('/login');
        req.session.goto = req.url;
        res.end();
    }else{
        next();
    }
}

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "supershare!", store: new RedisStore }));
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
  if(req.session.goto){
    res.redirect(req.session.goto)
    delete req.session.goto;
    return;
  }
  res.render('index', {
    title: '首页'
  });
});

app.get('/explorer', function(req, res){
    Share.distinct('tags',{}, function(err, docs){
        res.render('explorer', {
            title : '发现',
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


app.get('/create-ok/:shareId',function(req,res){
    res.render('create-ok', {
        title: '创建成功',
        share : req.share
    });
});


//show a rate
app.get('/show/:shareId', function(req, res){
    var share = req.share;
    res.render('showrate', {
        title : share.authors.join(',') + ':' + share.title,
        share : share
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

function squery(req, res, next){
    //console.dir(_.keys(req));
    var query = req.query;
    var sharequery = Share.find(query);
    sharequery.sort('_id',-1);
    sharequery.exec(function(err,shares){
        if(err) return next(err);
        req.results = shares;
        next();
    });
}

function setQuery(req, res, next){
    //console.dir(_.keys(req));
    var query = req.query;
    var sharequery = ShareSet.find(query);
    sharequery.sort('_id',-1);
    sharequery.exec(function(err,shares){
        if(err) return next(err);
        req.results = shares;
        next();
    });
}

app.param('setId',function(req,res,next,id){
    ShareSet.findById(id, function(err,shareset){
        if(err) return next(err)
        if(!shareset) return next(new Error('ShareSet not found'))
        req.shareset = shareset;
        next();
    });
});

app.param('shareId', function(req,res,next,id){
    Share.findById(id, function(err,share){
        if(err) return next(err)
        if(!share) return next(new Error('Share not found'))
        req.share = share;
        next();
    });
});
app.param('listtype',function(req,res,next,type){
    if('my' === type){
        if(!req.loggedIn){
            req.session.goto = req.url;
            res.redirect('/login');
            return res.end();

        }
        req.query.owner = req.user._id;
        next();
    }
});

//list the rates
app.get('/list/:listtype?',squery, function(req,res){
    res.render('list', {
        results : req.results,
        query : req.query,
        type : req.params.listtype,
        title : '所有分享'
    });
});

app.get('/setlist/:listtype?',setQuery, function(req,res){
    res.render('setlist', {
        results : req.results,
        query : req.query,
        type : req.params.listtype,
        title : '所有分享'
    });
});
function getShares(req,res,next){
    console.log('getShares setId', req.params.setId);
    Share.find({
            shareset : req.params.setId
        },
        function(err,shares){
            if(err) return next(err)
            req.shares = shares;
            next();
        }
    );
}
app.get('/shareset/:setId', getShares, function(req, res){
    var ss = req.shareset;

    res.render('shareset',{
        title : ss.subject
       ,shareset : ss
       ,shares : req.shares
    });

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

app.error(function(err, req, res, next){
    console.log('on error');
    if(err instanceof NotFound){
        console.log('on error:not found');
        res.render('404',{
            title : 404
        });
    }else{
        next(err);
    }
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this,msg);
    Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;

app.get('/404', function(req,res){
    throw new NotFound;
});

app.get('/500', function(req,res){
    throw new Error('just an small error;');
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

app.post('/edit/slider/:shareId',function(req, res){
    console.log('post ');
    var share = req.share,
        slideshare = req.param('slideshare'),
        url = req.param('url');
    //get the id out of the slideshare
    var match = slideshare.match(/\d{6,}/);
    if(match){
        share.slider.slideshare = match[0];
    }
    share.slider.url = url;
    share.save(function(err){
        if(err) return next(err);
        res.redirect('/show/'+share._id);
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

_(require('./routers/manage')).each(function(o, key){
    _(o).each(function(fn, k){
        app[k]('/' + key, checkauth, fn);
    });
});

//_(require('./routers/')).each(function(pack,packname){

    //_(pack).each(function(fn, key){
        //console.log(packname, key);
        //app.get('/'+packname+'/' + key, fn);
    //});

//});

app.helpers({
    dateFormat : dateFormat
});

everyauth.helpExpress(app);
exports.app = app;
