/**
 * Module dependencies.
 */

var express = require('express');

//var QRcode = require('qrcode');
var _ = require("underscore");
var apptitle = ' - 火鸟打分系统';
var average = require('./modules/average').average;
var app = module.exports = express.createServer(); // Configuration
var db = require('./mods/db');
var Share = db.Share;


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);

  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    console.log('development');
    apptitle += '(dev)';
    app.set("app_prefix", "dev_");
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    console.log('production');
    app.use(express.errorHandler());
    app.set("app_prefix", "");
    app.set("view cache", true);
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: '首页 ' + apptitle
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
    res.render('create', {
        title: 'Create a Cate' + apptitle,
        error : [],
        doc : {
            title : '',
            tags : '',
            authors : []
        }
    });
});

/**
 * create a share
 */
app.post('/create',function(req,res){
    var doc = {
            title : req.param('title').trim(),
            authors : req.param('author').replace(/，/g,",").split(","),
            tags : req.param('tags').replace(/ +/g,",").replace(/，+/g,",").replace(/,+/g,",").split(","),
            rates : [],
            desc : '',
            longdesc : ''
        },
        error = [];

    doc.tags = _(doc.tags).chain()
        .map(function(tag){
            return tag.trim();
        })
        .without('')
        .uniq()
        .value();

    doc.authors = _(doc.authors).map(function(author){
        return author.trim();
    });

    if(doc.authors.length === 1 && doc.authors[0] === ''){
        error.push("请输入 分享者");
    }

    if(!doc.title){
        error.push("请输入 分享标题");
    }

    if(error.length > 0){
        res.render('create', {
            title: 'Create a Cate' + apptitle,
            error : error,
            doc : doc
        });
        return;
    }

    var share = new Share(doc);

    share.save(function(err,doc){
        res.redirect('/create-ok/' + doc._id);
    });
});

app.get('/create-ok/:id',function(req,res){
    res.render('create-ok', {
        title: 'Create a Cate' + apptitle,
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
                item.tdate = new Date(item.ts.toNumber());
                _(['rate1','rate2','rate3','rate4']).each(function(idx){
                    item[idx] = Math.round(item[idx]*10)/10;
                });
            });


            res.render('showrate', {
                title : doc.title + apptitle,
                doc : doc,
                app_pre : app.set("app_prefix"),
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
                title : '所有分享' + apptitle
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

app.get('/qrcode',function(req,res){
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
            title :'rate' + apptitle,
            css : 'rate'
        });
    });
});

_(require('./account')).each(function(fn,key){
    app.get('/account/' + key, errorQuery,  fn);
});

exports.app = app;
