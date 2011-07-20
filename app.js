/**
 * Module dependencies.
 */

var express = require('express');
var mongod = require('mongodb');

var app = module.exports = express.createServer(); // Configuration
var db;

function avi (arr){
    var sum = 0;
    var len = arr.length;
    arr.forEach(function(v){
        sum += v;
    });
    if(len === 0 ) return 0;
    return Math.round(sum / len * 100)/100;
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
    console.log("development");
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
    console.log("production");
    app.use(express.errorHandler());
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
    title: 'Express'
  });
});

//** jsonp
app.get('/insert/:data', function(req, res){
    var doc;

    doc = JSON.parse(req.params.data);
    doc.name = encodeURIComponent(doc.name);
    doc.title = encodeURIComponent(doc.title);
    var data = new Date();
    doc.ts_save = date.getTime();

    if(!doc){
        res.send("error");
        return;
    }

    db.open(function(err,db){
        db.collection("rate", function(err,collection){
            collection.insert(doc,function(err, doc){
                res.send(req.param("callback") + "(" + JSON.stringify(doc[0]) + ")");
                db.close();
            });
        });
    });

});

app.get('/create',function(req,res){
  res.render('create', {
    title: 'Create a Cate'
  });
});

app.post('/create',function(req,res){
    var doc = {};
    doc.author = encodeURIComponent(req.param("author"));
    doc.title = encodeURIComponent(req.param("title"));
    doc.other = encodeURIComponent(req.param("other"));
    doc.ts_save = new Date().getTime();

    if(!doc){
        res.send("error");
        return;
    }

    db.open(function(err,db){
        db.collection("rate", function(err,collection){
            collection.insert(doc,function(err, doc){
                var outdata = {
                    title : "Success!",
                    data : doc
                };
                res.render('create-ok', outdata);
                db.close();
            });
        });
    });
});

//show a rate
app.get('/show/:rid', function(req, res){
    var rateid = req.params.rid;
    var query = {"_id" : mongod.BSONPure.ObjectID(rateid)};
    var result = {};

    db.open(function(err,db){
        db.collection("rate", function(err,collection){
            console.log("querying : " + query);
            collection.find(query,{limit:1}, function(err,cursor){
                cursor.each(function(err,rate){

                    var json, date;

                    if(rate !== null) {
                        result = rate;
                    }

                    if(rate === null){
                        console.log(result.ts_save,result.ts_save);
                        date = new Date(result.ts_save);
                        res.render('showrate', {
                            title : result.title + " - rate",
                            r_dateSave : date.toLocaleDateString() + date.toLocaleTimeString(),
                            r_title : decodeURIComponent(result.title),
                            r_author : decodeURIComponent(result.author),
                            _id : result._id
                        });
                        db.close();
                    }
                });
            });
        });
    });
});

//** jsonp
app.get('/getrate/:rid', function(req, res){
    var rateid = req.params.rid;
    var query = rateid?{"id" : rateid}:{};
    var callback = req.param("callback");
    var result = {};

    db.open(function(err,db){
        db.collection("rate", function(err,collection){
            collection.find(query,{limit:1}, function(err,cursor){
                cursor.each(function(err,rate){
                    var json;
                    if(rate !== null) {
                        result = rate;
                    }
                    if(rate === null){
                        json = JSON.stringify(result),
                        res.header('Content-Type','text/plain');
                        if(callback){
                            res.send(callback+"("+json+")");
                        }else{
                            res.send(json);
                        }
                        db.close();
                    }
                });
            });
        });
    });
});

app.get('/list',function(req,res){
    var query = {},
        result = [];

    db.open(function(err,db){
        db.collection("rate", function(err,collection){
            collection.find(
                query,
                {
                    'sort' : [["ts_save","desc"]]
                },
                function(err,cursor){
                    cursor.each(function(err,doc){
                        if(doc !== null ){
                            doc.title = decodeURIComponent(doc.title);
                            doc.name = decodeURIComponent(doc.name);
                            result.push(doc);
                            if(doc.rates && doc.rates.length){
                                doc.score = avi(doc.rates);
                            }else{
                                doc.score = 0;
                            }
                        }else{
                            res.render("list", {
                                result : result,
                                title : "All Rate"
                            })
                            db.close();
                        }
                    });
                });
        });
    });
});

app.get('/rate/:rid',function(req,res){
  res.render('rate',{
     title:'SUCCESS!'
  });
});

app.listen(3000);

console.log("Express server listening on port %d", app.address().port);
