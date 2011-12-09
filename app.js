/**
 * Module dependencies.
 */

var express = require('express');

var _ = require("underscore");
var modules = require('./modules/');
var resource = require('express-resource');
var everyauth = require('./modules/auth').everyauth;
var RedisStore = require('connect-redis')(express);
var form = require('connect-form');
var moment = require('moment');
var markdown = require('markdown').markdown;

var app = module.exports = express.createServer();
var Share = modules.Share;
var User = modules.User;
var ShareSet = modules.ShareSet;

function redirect(req, res, next){
    if(req.param('redirect')){
        req.session.redirectTo = req.param('redirect')
        return next();
    }
    next();
}

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(form({
      keepExtensions : true,
      uploadDir : './public/upload'
    }));
    //upload
    app.use(function(req,res,next){
        if(req.form && req.is('multipart/form-data')){
            req.form.complete(function(err, fields, files){
                if(err) {
                    return next(err);
                }
                req.fields = fields;
                req.files = files;
                next();
            });
            return;
        }
        next();
    });
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "supershare!", store: new RedisStore }));
    app.use(redirect);
    app.use(everyauth.middleware());
    app.use(express.methodOverride());
    app.use(app.router);
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
   ,navtab : 'home'
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

app.resource('shareset', require('./routers/shareset'));
app.resource('share', require('./routers/share'));

/**
 *  错误处理
 */
function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this,msg);
    Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;

app.error(function(err, req, res, next){
    if(err instanceof NotFound){
        res.render('404',{
            title : 404
           ,navtab : ''
        });
    }else{
        next(err);
    }
});

app.get('/404', function(req,res){
    throw new NotFound;
});

app.get('/500', function(req,res){
    throw new Error('just an small error;');
});

//喜欢按钮
app.get('/share/:share/like', function(req,res){
    if(!req.session){
        res.send({ errors : ["您已经投过票了"]});
        return;
    }
    var liked = req.session.shareliked,
        share = req.share,
        shareId = req.params.share;

    if(!liked){
        liked = [];
    }
    if(liked.indexOf(shareId) !== -1){
        res.send({ errors : ["您已经投过票了"]});
        return;
    }

    share.like += 1;
    share.save(function(err, doc){
        if(err) return res.send({
            errors : err.errors || err
        });
        liked.push(shareId);
        req.session.shareliked = liked;
        res.send({
            errors : null,
            action : 'redirect',
            redirect : ''
        });
    });
});


// 编辑幻灯片
app.post('/share/:share/editslider',function(req, res){
    var share = req.share,
        slideshare = req.param('slideshare');
    //get the id out of the slideshare embed Code
    var match = slideshare.match(/\d{6,}/);
    if(match){
        share.slider.slideshare = match[0];
    }else{
        res.send({
            errors : ['错误的embed Code']
        });
        return;
    }

    share.save(function(err){
        if(err) {
            res.send({
                errors : ['保存出错']
            });
        }
        res.send({
            errors : null,
            action : 'redirect',
            redirect : ''
        });
    });
});

// 封面上传
app.get('/share/:share/upload-cover', function(req, res){
    res.render('shareset/share-cover-upload', {
        title : 'Upload Cover'
       ,share : req.share
       ,backurl : req.header('Referer')
       ,navtab : 'share'
    });
});

// 封面上传
app.post('/share/:share/upload-cover', function(req, res){
    var share = req.share,
        form = req.form,
        files;
    if(!form || !req.files){
        return res.redirect('back');
    }
    files = req.files;
    if(!files.cover){
        res.redirect('back');
        return;
    }

    share.cover = files.cover.path.replace(/^public/,'');

    share.save(function(err, saved){
        res.render('shareset/share-cover-upload',{
            title : '上传'
           ,share : saved
           ,navtab : 'share'
           ,backurl : req.fields.backurl
        });
    });
});

app.post('/share/:share/content',function(req,res){
    req.share.content = req.param('content');
    req.share.contentHTML = markdown.toHTML(req.share.content);
    req.share.save(function(err,share){
        if(err) return next(err);
        res.redirect('back');
    });
});

/**
 * helpers for view
 */
app.helpers({
    moment : moment,
    markdown : markdown
});

everyauth.helpExpress(app);
exports.app = app;
