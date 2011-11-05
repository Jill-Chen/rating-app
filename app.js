/**
 * Module dependencies.
 */

var express = require('express');

//var QRcode = require('qrcode');
var _ = require("underscore");
var modules = require('./modules/');
var resource = require('express-resource');
var auth = require('./modules/auth').everyauth;
var RedisStore = require('connect-redis')(express);
var dateFormat = require('dateformat');
var form = require('connect-form');

var app = module.exports = express.createServer(
        form({keepExtensions : true })
    ); // Configuration
var Share = modules.Share;
var User = modules.User;
var ShareSet = modules.ShareSet;

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
  app.use(auth.middleware());
  //app.use(express.methodOverride());
  //app.use(parted({
    //path : __dirname + '/public/uploads',
    //limit : 30 * 1024,
    //diskLimit : 30 * 1024 * 1024,
    //multiple : true
  //}));

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

app.get('/json/tags', function(req, res){
    Share.distinct('tags',{}, function(err, docs){
        res.send({
            isSuccess : true,
            tags : docs
        });
    });
});




var shareset = app.resource('shareset', require('./routers/shareset'));
var share = app.resource('share', require('./routers/share'));
//shareset.add(share);

/**
 *  错误处理
 */
app.error(function(err, req, res, next){
    if(err instanceof NotFound){
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

/**
 * MISC 零碎功能
 */
// 生成二维码
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

// 编辑幻灯片
app.post('/edit/slider/:share',function(req, res){
    var share = req.share,
        slideshare = req.param('slideshare');
    //get the id out of the slideshare
    var match = slideshare.match(/\d{6,}/);
    if(match){
        share.slider.slideshare = match[0];
    }
    share.save(function(err){
        if(err) return next(err);
        res.redirect('back');
    });
});

/**
 * helpers for view
 */
app.helpers({
    dateFormat : dateFormat
});

auth.helpExpress(app);
exports.app = app;
