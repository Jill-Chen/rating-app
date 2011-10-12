/**
 * Module dependencies.
 */

var express = require('express');

var mongod = require('mongodb');
var QRcode = require('qrcode');
var _ = require("underscore");
var BSON = mongod.BSONPure;
var apptitle = ' - 火鸟打分系统';
var average = require('./modules/average').average;
var app = module.exports = express.createServer(); // Configuration
var db;
var col = null;


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
    db = new mongod.Db(
        'firebird_dev',
        new mongod.Server('127.0.0.1', 27017),
        {
            native_parser:false
        }
    );
    db.open(function(err,db){
        db.collection('rate', function(err, collection){
            col = collection;
        });
    });
});

app.configure('production', function(){
    console.log('production');
    app.use(express.errorHandler());
    app.set("app_prefix", "");
    app.set("view cache", true);
    db = new mongod.Db(
        'firebird',
        new mongod.Server('127.0.0.1', 27017),
        {
            native_parser:false
        }
    );
    db.open(function(err,db){
        db.collection('rate', function(err, collection){
            col = collection;
        });
    });
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: '首页 ' + apptitle
  });
});

app.get('/tags', function(req, res){
    col.find({}, { tags : 1 }, function(err, cursor){
        var docs = [];
        cursor.each(function(err,doc){
            if(doc && doc.tags){
                docs.push(doc.tags);
            }else if(!doc){
                //update tag
                res.render('tags', {
                    title : '标签',
                    tags : _.compact(_.uniq(_.flatten(docs)))
                });
            }
        });
    });
});

app.get('/json/tags', function(req, res){
    col.find({}, { tags : 1 }, function(err, cursor){
        var docs = [];
        cursor.each(function(err,doc){
            if(doc && doc.tags){
                docs.push(doc.tags);
            }else if(!doc){
                //update tag
                res.send({
                    isSuccess : true,
                    tags : _.compact(_.uniq(_.flatten(docs)))
                });
            }
        });
    });
});

app.get('/create',function(req,res){
    res.render('create', {
        title: 'Create a Cate' + apptitle,
        error : [],
        ratetitle : '',
        rateauthor : '',
        ratetags: ''
    });
});

app.post('/create',function(req,res){
    var doc = {};
    var title = req.param('title').trim(),
        authors = req.param('author').replace(/，/g,",").split(","),
        tags = req.param('tags').replace(/ +/g,",").replace(/，+/g,",").replace(/,+/g,",").split(","),
        error = [];

    tags = _(tags).chain()
        .map(function(tag){
            return tag.trim();
        })
        .without('')
        .uniq()
        .value();

    authors = _(authors).map(function(author){
        return author.trim();
    });

    if(authors.length === 1 && authors[0] === ''){
        error.push("请输入 分享者");
    }

    if(!title){
        error.push("请输入 分享标题");
    }

    if(error.length > 0){
        res.render('create', {
            title: 'Create a Cate' + apptitle,
            error : error,
            ratetitle : title,
            rateauthor : authors.join(", "),
            ratetags : tags.join(", ")
        });
        return;
    }
    doc.authors = authors;
    doc.title = title;
    doc.tags = tags;

    doc.rates = [];
    doc.ts_save = new Date().getTime();
    col.insert(doc,function(err, doc){
        //update tag
        res.redirect('/create-ok/'+doc[0]._id);
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
    var query = {'_id' : BSON.ObjectID(rateid)};
    var result = {};
    col.findOne(query, function(err,doc){
        var json, date, tags, title, rates;
        if(doc) {
            date = new Date(doc.ts_save.toNumber());

            doc.rates.forEach(function(item,idx){
                item.tdate = new Date(item.ts.toNumber());
            });

            title = doc.title;

            tags = doc.tags;

            _(doc.rates).each(function(item){
                _(['rate1','rate2','rate3','rate4']).each(function(idx){
                    item[idx] = Math.round(item[idx]*10)/10;
                });
            });


            res.render('showrate', {
                title : title + apptitle,
                r_dateSave : date,
                r_title : title,
                app_pre : app.set("app_prefix"),
                r_authors : doc.authors,
                rates : doc.rates,
                tags : tags,
                _id : doc._id
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

    col.findOne(query, function(err,doc){
            var json;
            if(doc) {
                json = JSON.stringify(doc);
                res.header('Content-Type', 'data/plain');
                res.header('Content-Disposition','attachment; filename='+doc.title+'.json');
                res.send(json);
            }

    });
});

app.get('/tag/:tag', function(req,res){
    var querytag = req.params.tag;

    col.find({"tags" : querytag},{ 'sort' : [['ts_save','desc']] }, function(err, cursor){
        var result = [];
        cursor.each(function(err,doc){
            if(doc !== null ){
                doc.title = doc.title;
                doc.date = new Date(doc.ts_save.toNumber());
                doc.authors = doc.authors;
                doc.tags = doc.tags;
                result.push(doc);

                if(doc.rates && doc.rates.length){
                    doc.score = average(doc.rates);
                }else{
                    doc.score = 0;
                }

            }else{
                res.render('list', {
                    result : result,
                    query : query,
                    title : '所有分享' + apptitle
                });
            }
        });
    });
});

//list the rates
app.get('/list/:query?',function(req,res){
    var query = {},
        author = req.param("author", ""),
        title = req.param("title", ""),
        tag = req.param("tag", "");

    console.log("list:", query);

    if(author.length > 0){
        query.authors = author;
    }

    if(title.length > 0){
        query.title = title;
    }

    if(tag.length > 0){
        query.tags = tag;
    }


    col.find(
        query,
        { 'sort' : [['_id','desc']] },
        function(err,cursor){
            var result = [];
            cursor.each(function(err,doc){
                if(doc !== null ){
                    doc.title = doc.title;
                    doc.date = new Date(doc.ts_save.toNumber());
                    doc.authors = doc.authors;
                    doc.tags = doc.tags;
                    result.push(doc);

                    if(doc.rates && doc.rates.length){
                        doc.score = average(doc.rates);
                    }else{
                        doc.score = 0;
                    }

                }else{
                    res.render('list', {
                        result : result,
                        query : query,
                        title : '所有分享' + apptitle
                    });
                }
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

    col.update({
        _id : BSON.ObjectID(id)
    },{
        $push : {
            rates : ratedata
        }
    }, function(err, data){
        res.redirect("/show/"+id);
    });
});

app.get('/qrcode',function(req,res){
    var url = req.param('url');
    QRcode.toDataURL(url,function(err, data){
        res.send({
            isSuccess : true,
            dataURL : data
        });
    });
});

app.get('/rate/:rid',function(req,res){
    var rateid = req.params.rid,
        query = {'_id' : BSON.ObjectID(rateid)};

    col.findOne(query, function(err, doc){
        res.render('rate2',{
            share : doc,
            title :'rate' + apptitle,
            css : 'rate',
            rid : req.params.rid
        });
    });
});

exports.app = app;
