/**
 * Module dependencies.
 */

var express = require('express');

var _ = require("underscore");
var modules = require('./modules/');
var resource = require('express-resource');
var everyauth = require('./mods/auth').everyauth;
var RedisStore = require('connect-redis')(express);
var moment = require('moment');
var md = require('node-markdown').Markdown;
var ejs = require('ejs');
var jade = require('jade');
var developmod = false;
var init = require('./mods/init');

var app = module.exports = express.createServer();

//Modules
var User = modules.User;
var File = modules.File;
var Share = modules.Share;
var ShareSet = modules.ShareSet;
var Post = modules.Post;
var Feedback = modules.Feedback;

var Errors = require('./mods/errors');

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
        uploadDir: __dirname + '/public/upload'
       ,keepExtensions : true
    }));
    app.use(express.cookieParser());
    app.use(express.session({ secret: "supershare!", store: new RedisStore }));
    app.use(redirect);
    app.use(everyauth.middleware());
    app.use(express.methodOverride());
    app.use(function(req,res,next){
        //上传列表
        if(!req.files){
            next();
            return;
        }
        _(req.files).each(function(oFile){
            if(oFile.size === 0){
                return;
            }
            oFile.path = oFile.path.replace(/^.*\/public\/upload/,'/upload')
            var file = new File({
                name : oFile.name
               ,size : oFile.size
               ,path : oFile.path
               ,type : oFile.type
               ,uploader : req.loggedIn?req.user._id : null
            });
            file.save();
        });
        next();
    });
    app.use(app.router);

    //个性错误处理
    app.error(function(err, req, res, next){
        if(err instanceof Errors.NotFound){
            res.render('404',{
                title : 404
               ,navtab : ''
            });
        } else if(err instanceof Errors.NoPermission){
            res.send({
                errors : [{type:'没有权限!'}]
            });
        } else{
            next(err);
        }
    });
});

app.configure('development', function(){
    developmod  = true;
    app.error(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.error(express.errorHandler())
    app.set("view cache", true);
});




// Routes
/**
 * 首页
 */
app.get('/', function(req, res){
  if(req.session.goto){
    res.redirect(req.session.goto)
    delete req.session.goto;
    return;
  }
  res.render('index/index', {
    title: '分享平台'
   ,navtab : 'home'
  });
});

/**
 * 日历
 */
app.get('/calendar', function(req,res){
  res.render('calendar', {
    layout : 'layout-calendar'
   ,title: '分享会日历'
   ,navtab : 'shareset'
  });
});

/**
 * 发现分享
 */
app.get('/explore', function(req,res){
  res.render('explore', {
    layout : 'layout-explore'
   ,title: '发现分享'
   ,navtab : 'explore'
  });
});

/**
 * 平台反馈页面
 */
app.get('/feedback', function(req, res){
  res.render('index/feedback', {
    title: '反馈与讨论 分享平台'
   ,navtab : 'feedback'
  });
});

/**
 * 异步获取全部标签
 */
app.get('/json/tags', function(req, res,next){
    init.getTags(function(err,docs){
        if(err) throw new Error(err);
        var tags = [];
        _(docs).each(function(v,k){
            tags.push({tag:k, count :v});
        });
        res.send(tags);
    });
});

app.get('/api/summary',function(req,res,next){
    Share.distinct('tags',{}, function(err, docs){
        if(err) return next(err);
        res.send({
            tags : docs
        });
    });
});

app.resource('shareset', require('./routers/shareset'));
app.resource('share', require('./routers/share'));


app.get('/500', function(req,res){
    throw new Error('just an small error;');
});

//喜欢按钮
app.get('/share/:share/like', function(req,res){
    if(!req.session){
        res.send({ errors : [{type:"您已经投过票了"}]});
        return;
    }
    var liked = req.session.shareliked,
        share = req.share,
        shareId = req.params.share;

    if(!liked){
        liked = [];
    }
    if(liked.indexOf(shareId) !== -1){
        res.send({ errors : [{type:"您已经投过票了"}]});
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

    share.cover = files.cover.path;

    share.save(function(err, saved){
        res.render('shareset/share-cover-upload',{
            title : '上传'
           ,share : saved
           ,navtab : 'share'
           ,backurl : req.param('backurl')
        });
    });
});

// 分享内容编辑
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
            res.send({
                html : so_cache
            });
        });

    });
});

app.post('/uploadmgr',function(req,res){
    res.partial('uploaded', {
        files : req.files
    });
});


//生成日历文件
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

app.get('/fb/:shareset', function(req,res){
    res.render('feedback/feedback', {
        layout : 'layout-feedback',
        shareset : req.shareset,
        title : '谢谢您的反馈'
    });
});

app.post('/fb/:shareset', function(req,res){
    var body = req.body,
        shares = {},
        toshares = [];

    _(req.shareset.shares).each(function(v){
        shares[v._id] = v;
    });

    _(body.toshare).each(function(v,k){
        v.share = k;
        v.title = shares[k].title;
        v.authors = shares[k].authors.join(', ');
        toshares.push(v);
    });

    var fb = new Feedback({
        shareset : req.shareset._id,
        toShareset : body.toshareset,
        toShares : toshares
    });

    fb.save(function(err, saved){
        res.redirect('/fb/'+req.shareset.postname+ '/success');
    });

});

app.get('/fb/:shareset/show',function(req,res){
    var shareset = req.shareset;
    Feedback.find({
        shareset : shareset._id
    }, function(err,docs){
        res.send({
            feedbacks : docs,
        });
    });
});

app.get('/user/edit',function(req,res){
    res.render('auth/edit', {
        title : '修改用户名',
        user : req.user
    });
});

app.post('/user/edit',function(req,res){
    var user = req.user,
        name = req.param('name');

    user.name = name;
    user.save(function(err, user){
        if(err) return next(err);
        res.render('auth/edit', {
            title : '修改成功!',
            user : req.user
        });
    });

});

app.get('/fb/:shareset/success',function(req,res){
    res.render('feedback/feedback-success', {
        layout : 'layout-feedback',
        shareset : req.shareset,
        title : '谢谢您的反馈'
    });
})


app.get('/404', function(req,res,next){
    throw new Errors.NotFound;
});

app.get('/500', function(req,res,next){
    throw new Errors;
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
