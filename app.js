/**
 * Module dependencies.
 */

var express = require('express');
var mongod = require('mongodb');
var BSON = mongod.BSONPure;
var apptitle = ' - 火鸟打分系统';
console.log("r", require.resolve('./modules/average'));
var average = require('./modules/average').average;


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
    apptitle += '(dev)'
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

app.get('/create',function(req,res){
    res.render('create', {
        title: 'Create a Cate' + apptitle,
        error : [],
        ratetitle : '',
        rateauthor : '',
        rateother : ''
    });
});

app.post('/create',function(req,res){
    var doc = {};
    var author = req.param('author').trim(),
        title = req.param('title').trim(),
        other = req.param('other').trim(),
        error = [];
    if(!author){
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
            rateauthor : author,
            rateother : other
        });
        return;
    }
    doc.author = encodeURIComponent(author);
    doc.title = encodeURIComponent(title);
    doc.other = encodeURIComponent(other);
    doc.rates = [];
    doc.ts_save = new Date().getTime();
    ratedb(function(err,collection){
        collection.insert(doc,function(err, doc){
            db.close();
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
                title = decodeURIComponent(doc.title);

                res.render('showrate', {
                    title : title + apptitle,
                    r_dateSave : date,
                    r_title : title,
                    r_author : decodeURIComponent(doc.author),
                    rates : doc.rates,
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
                    res.header('Content-Disposition','attachment; filename='+decodeURIComponent(doc.title)+'.json');
                    res.send(json);
                }

                db.close();
        });
    });
});
app.get('/list/:query?',function(req,res){
    var query = {},
        author = req.param("author", ""),
        title = req.param("title", "");
    if(author.length > 0){
        query.author = encodeURIComponent(author);
    }
    if(title.length > 0){
        query.title = encodeURIComponent(title);
    }
    console.log("list:", query);
    ratedb(function(err,collection){
        collection.find(
            query,
            { 'sort' : [['ts_save','desc']] },
            function(err,cursor){
                var result = [];
                cursor.each(function(err,doc){
                    if(doc !== null ){
                        doc.title = decodeURIComponent(doc.title);
                        doc.date = new Date(doc.ts_save.toNumber());
                        doc.author = decodeURIComponent(doc.author);
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
