/**
 * Module dependencies.
 */

var express = require('express');

//var QRcode = require('qrcode');
var _ = require("underscore");
var apptitle = '火鸟打分系统';
var average = require('./modules/average').average;
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

function getShareset(req,res,next){
    if(req.share.shareset){
        ShareSet.findById(req.share.shareset, function(err, shareset){
            if(err) return next(err);
            req.shareset = shareset;
            next();
        });
    }else{
        req.shareset = null;
        next();
    }
}

app.get('/create-ok/:shareId', getShareset, function(req,res){
    res.render('create-ok', {
        title: '创建成功',
        share : req.share,
        shareset : req.shareset
    });
});


//show a rate
//app.get('/share/show/:shareId', getShareset, function(req, res){
    //var share = req.share;
    //res.render('showrate', {
        //title : share.authors.join(',') + ':' + share.title,
        //share : share,
        //shareset : req.shareset
    //});
//});

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


Share.load = function(req,id,fn){
    console.log('sload',req,id,fn);
}

var shareset = app.resource('shareset', require('./routers/shareset'));
var share = app.resource('share', require('./routers/share'));


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
    query.deleted = {"$ne":true};
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
//app.get('/share/list/:listtype?',squery, function(req,res){
    //res.render('list', {
        //results : req.results,
        //query : req.query,
        //type : req.params.listtype,
        //title : '所有分享'
    //});
//});

//app.get('/shareset/list/:listtype?',setQuery, function(req,res){
    //res.render('setlist', {
        //results : req.results,
        //query : req.query,
        //type : req.params.listtype,
        //title : '所有分享'
    //});
//});

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
//app.get('/shareset/show/:setId', getShares, function(req, res){
    //var ss = req.shareset;
    //res.render('shareset',{
        //title : ss.subject
       //,shareset : ss
       //,shares : req.shares
    //});
//});

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

//_(require('./routers/manage')).each(function(o, key){
    //_(o).each(function(fn, k){
        //console.log(k, key);
        //app[k](key, checkauth, fn);
    //});
//});

//_(require('./routers/')).each(function(pack,packname){

    //_(pack).each(function(fn, key){
        //console.log(packname, key);
        //app.get('/'+packname+'/' + key, fn);
    //});

//});

app.helpers({
    dateFormat : dateFormat
});

auth.helpExpress(app);
exports.app = app;
