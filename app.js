/**
 * Module dependencies.
 */

var express = require('express');
var mongod = require('mongodb');
var BSON = mongod.BSONPure;


var app = module.exports = express.createServer(); // Configuration
var db;

function avi (arr){
    var sum1 = 0,sum2=0,sum3=0,sum4=0,sum=[];
    var len = arr.length;
    arr.forEach(function(v){
        sum1 += v['rate1'];
        sum2 += v['rate2'];
        sum3 += v['rate3'];
        sum4 += v['rate4'];
    });
    //console.log(sum);
    //console.log(sum2);
    //console.log(sum3);
    //console.log(sum4);
//    sum = sum1+sum2+sum3+sum4;
    if(len === 0 ) return 0;
    sum.push(Math.round(sum1 / len * 100)/100);
    sum.push(Math.round(sum2 / len * 100)/100);
    sum.push(Math.round(sum3 / len * 100)/100);
    sum.push(Math.round(sum4 / len * 100)/100);
    console.log(sum);
    return sum;
//    return Math.round(sum1 / len * 100)/100;
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

app.get('/create',function(req,res){
  res.render('create', {
    title: 'Create a Cate'
  });
});

app.get('/create-ok/:id',function(req,res){
  res.render('create-ok', {
    title: 'Create a Cate',
    id : req.params.id
  });
});

app.post('/create',function(req,res){
    var doc = {};

    db.open(function(err,db){
        doc.author = encodeURIComponent(req.param("author"));
        doc.title = encodeURIComponent(req.param("title"));
        doc.other = encodeURIComponent(req.param("other"));
        doc.rates = [];
        doc.ts_save = new Date().getTime();

        db.collection("rate", function(err,collection){
            collection.insert(doc,function(err, doc){
                db.close();
                res.redirect("/create-ok/"+doc[0]._id);
            });
        });
    });
});

//show a rate
app.get('/show/:rid', function(req, res){
    var rateid = req.params.rid;
    var query = {"_id" : BSON.ObjectID(rateid)};
    var result = {};

    db.open(function(err,db){
        db.collection("rate", function(err,collection){
            console.log("querying : " + query);
            collection.findOne(query, function(err,doc){
                var json, date;
                if(doc) {
                    date = new Date(doc.ts_save.toNumber());
                    title = decodeURIComponent(doc.title);
                    res.render('showrate', {
                        title : title + " - rate",
                        r_dateSave : date,
                        r_title : title,
                        r_author : decodeURIComponent(doc.author),
                        rates : doc.rates,
                        _id : doc._id
                    });
                }else{
                    res.redirect("/list");
                }
                db.close();
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

app.post("/ratedo", function(req, res){

    var id = req.param("rid");
    var rate1 = parseInt(req.param("rate1"));
    var rate2 = parseInt(req.param("rate2"));
    var rate3 = parseInt(req.param("rate3"));
    var rate4 = parseInt(req.param("rate4"));

    var ratedata = {
        rate1 : rate1,
        rate2 : rate2,
        rate3 : rate3,
        rate4 : rate4,
        ts : new Date().getTime()
    };

    db.open(function(err,db){
        db.collection("rate", function(err, collection){
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
                        console.log(11111);
                        if(doc !== null ){
                            doc.title = decodeURIComponent(doc.title);
                            doc.date = new Date(doc.ts_save.toNumber());
                            doc.author = decodeURIComponent(doc.author);
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
                            });
                            db.close();
                        }
                    });
                });
        });
    });
});

app.get('/rate/:rid',function(req,res){
    res.render('rate2',{
        title:'rate',
        rid : req.params.rid
    });
});

app.listen(3000);

console.log("Express server listening on port %d", app.address().port);
