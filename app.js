/**
 * Module dependencies.
 */

var express = require('express');

var _ = require("underscore");
var modules = require('./modules/');
var resource = require('express-resource');
var everyauth = require('./modules/auth').everyauth;
var RedisStore = require('connect-redis')(express);
var moment = require('moment');
var md = require('node-markdown').Markdown;
var ejs = require('ejs');
var jade = require('jade');
var developmod = false;

var app = module.exports = express.createServer();

var User = modules.User;
var File = modules.File;
var Share = modules.Share;
var ShareSet = modules.ShareSet;
var Post = modules.Post;

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
    app.use(express.bodyParser({
        uploadDir: './public/upload'
       ,keepExtensions : true
    }));
    app.use(express.cookieParser());
    app.use(express.session({ secret: "supershare!", store: new RedisStore }));
    app.use(redirect);
    app.use(everyauth.middleware());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(function(req,res,next){
        //上传列表

        if(!req.files || req.files.length === 0){
            next();
            return;
        }

        next();
        _(req.files).each(function(oFile){
            var file = new File({
                name : oFile.name
               ,size : oFile.size
               ,path : oFile.path
               ,type : oFile.type
               ,uploader : req.loggedIn?req.user._id : null
            });
            file.save();
        });
    });
});

app.configure('development', function(){
    developmod  = true;
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
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
    title: '分享平台'
   ,navtab : 'home'
  });
});

app.get('/feedback', function(req, res){
  res.render('feedback', {
    title: '反馈与讨论 分享平台'
   ,navtab : 'feedback'
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
        files;

    if(!req.files){
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
           ,backurl : req.param('backurl')
        });
    });
});

app.post('/share/:share/content',function(req,res){
    var so = req.param('content')
       ,so_cache = md(so, false,'iframe|embed')
       ,post;

    req.share.content = so;
    req.share.contentHTML = so_cache;

    //for 历史记录
    post = new Post({
        share : req.share._id
       ,source : so
       ,cached : so_cache
    });

    req.share.save(function(err,share){
        if(err) return req.next(err);

        post.save(function(err, p){
            if(err) return req.next(err);
            res.redirect('back');
        });

    });

});

app.get('/shareset/:shareset/ics',function(req,res, next){
    /**
     * format date as UTC format as  '20000101T133000Z'
     * @param {Date|Moment} date object
     */
    function utcFormat(date){
        if(date.native){
            date = date.native();
        }
        var mo = moment(date);

        var timezoneOffset = date.getTimezoneOffset();
        var str = mo
            .add('minutes',timezoneOffset)
            .format('YYYYMMDDTHHmmssZ');
        return str;
    }

    /**
     * get of the array of hours and minutes from string '00:00'
     * @param {String} strTime
     * @return {Array}
     */
    function parseTime(strTime){
        var arr = strTime.split(':');
        if(arr.length < 2) return;

        return _(arr).map(function(d){
            return parseInt(d,10)
        });
    }

    var shareset = req.shareset
       ,date = shareset.date
       ,startTime =  parseTime(shareset.startTime)
       ,endTime  = parseTime(shareset.endTime)

       ,dtstart = moment(date.getTime())
            .hours(startTime[0])
            .minutes(startTime[1])

       ,dtend = moment(date.getTime())
            .hours(endTime[0])
            .minutes(endTime[1]);

    Share.find({shareset:shareset._id,deleted : {$ne : true}},function(err,shares){
        if(err)
            return next(err);

        jade.renderFile('./views/invite-cnt.jade',{
                shareset : shareset
               ,shares : shares
            },function(err,htmlcnt){
                if(err)
                    return next(err);
                ejs.renderFile('./views/invite.ics.ejs',{
                    shareset : req.shareset
                   ,dtstamp : utcFormat(new Date)
                   ,dtstart : utcFormat(dtstart)
                   ,cnt : htmlcnt.replace(/\n|\r\n/g,'')
                   ,dtend : utcFormat(dtend)
                },function(err,str){
                    if(err) return next(err);
                    res.send(str,{
                        'Content-Type':'text/calendar'
                       ,'Content-Disposition' : 'attachment; filename="' + shareset.subject + '.ics"'
                    }, 201);
                });
        });
    });
});

/**
 * helpers for view
 */
app.helpers({
    moment : moment,
    developmod  : developmod 
});

everyauth.helpExpress(app);
exports.app = app;
