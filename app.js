/**
 * Module dependencies.
 */

var express = require('express');
var mongod = require('mongodb');
var _ = require("underscore");
var BSON = mongod.BSONPure;
var apptitle = ' - 火鸟打分系统';
var average = require('./modules/average').average;
var coder = require('./modules/coder');

var app = module.exports = express.createServer(); // Configuration
var db;

function ratedb(callback){
    db.open(function(err,db){
        db.collection('rate', callback);
    });
}


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
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: apptitle
  });
});

app.get('/tags', function(req, res){
    ratedb(function(err,collection){
        collection.find({}, {tags : 1}, function(err, cursor){
            var docs = []
            cursor.each(function(err,doc){
                if(doc && doc.tags){
                    docs.push(doc.tags);
                }else if(!doc){
                    //update tag
                    res.render('tags', {
                        title : '标签',
                        tags : _.compact(_.uniq(_.flatten(docs)))
                    });
                    db.close();
                }
            });
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
        tags = req.param('tags').replace(/，/g,",").split(","),
        error = [];

    tags = _(tags).map(function(tag){
        return tag.trim();
    })
    authors = _(authors).map(function(author){
        return author.trim();
    })

    tags = _(tags).uniq();

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
    doc.authors = coder.encode(authors);
    doc.title = coder.encode(title);
    doc.tags = coder.encode(tags);

    doc.rates = [];
    doc.ts_save = new Date().getTime();
    ratedb(function(err,collection){
        collection.insert(doc,function(err, doc){
            db.close();
            //update tag
            res.redirect('/create-ok/'+doc[0]._id);
        });
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

    ratedb(function(err,collection){
        console.log('querying : ' + query._id);
        collection.findOne(query, function(err,doc){
            var json, date;
            if(doc) {
                date = new Date(doc.ts_save.toNumber());

                doc.rates.forEach(function(item,idx){
                    item.tdate = new Date(item.ts.toNumber());
                })

                title = coder.decode(doc.title);

                tags = coder.decode(doc.tags);

                res.render('showrate', {
                    title : title + apptitle,
                    r_dateSave : date,
                    r_title : title,
                    app_pre : app.set("app_prefix"),
                    r_authors : coder.decode(doc.authors),
                    rates : doc.rates,
                    tags : tags,
                    _id : doc._id
                });
            }else{
                res.redirect('/list');
            }
            db.close();
        });
    });
});

//** jsonp
app.get('/getrate/:rid', function(req, res){
    var rid = req.params.rid;
    var query = {'_id' : BSON.ObjectID(rid)};
    var result = {};

    ratedb(function(err,collection){
        collection.findOne(query, function(err,doc){
                var json;
                if(doc) {
                    json = JSON.stringify(doc),
                    res.header('Content-Type', 'data/plain');
                    res.header('Content-Disposition','attachment; filename='+coder.decode(doc.title)+'.json');
                    res.send(json);
                }

                db.close();
        });
    });
});

app.get('/tag/:tag', function(req,res){
    var querytag = req.params.tag;
    ratedb(function(err,collection){
        collection.find({"tags" : querytag},{ 'sort' : [['ts_save','desc']] }, function(err, cursor){
            var result = [];
            cursor.each(function(err,doc){
                if(doc !== null ){
                    doc.title = coder.decode(doc.title);
                    doc.date = new Date(doc.ts_save.toNumber());
                    doc.authors = coder.decode(doc.authors);
                    doc.tags = coder.decode(doc.tags);
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
                    db.close();
                }
            });
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
        query.authors = coder.encode(author);
    }

    if(title.length > 0){
        query.title = coder.encode(title);
    }

    if(tag.length > 0){
        query.tags = coder.encode(tag);
    }


    ratedb(function(err,collection){
        collection.find(
            query,
            { 'sort' : [['_id','desc']] },
            function(err,cursor){
                var result = [];
                cursor.each(function(err,doc){
                    if(doc !== null ){
                        doc.title = coder.decode(doc.title);
                        doc.date = new Date(doc.ts_save.toNumber());
                        doc.authors = coder.decode(doc.authors);
                        doc.tags = coder.decode(doc.tags);
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
                        db.close();
                    }
                });
            }
        );
    });
});

app.post("/ratedo", function(req, res){

    var id = req.param("rid");
    var rate1 = parseInt(req.param("rate1"));
    var rate2 = parseInt(req.param("rate2"));
    var rate3 = parseInt(req.param("rate3"));
    var rate4 = parseInt(req.param("rate4"));

    console.log(rate1);
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

    ratedb(function(err, collection){
        collection.update({
            _id : BSON.ObjectID(id)
        },{
            $push : {
                rates : ratedata
            }
        }, function(err, data){
            db.close();
            res.redirect("/show/"+id);
        });
    });
});

app.get('/rate/:rid',function(req,res){
    res.render('rate2',{
        title:'rate' + apptitle,
        css : 'rate',
        rid : req.params.rid
    });
});

app.listen(3000);

console.log('Express server listening on port %d', app.address().port);
