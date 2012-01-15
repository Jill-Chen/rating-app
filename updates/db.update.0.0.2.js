/**
 * update DB
 * @create 2012-01-14
 */
var mongodb = require('mongodb'),
    Db = mongodb.Db,
    Server = mongodb.Server;
var moment = require('moment');
var _ = require('underscore');

var tf = 'YYYY-MM-DD HH:mm:ss';

var client = new Db('ratting', new Server("127.0.0.1", 27017, {}));


client.open(function(err, client) {
    var sharesets = [],
        Share,Shareset,
        idx = 0;
    client.collection('shares',function(err, col){
        Share = col;
        client.collection('sharesets',function(err, col){
            Shareset = col;
            start();
        });
    });

    function findShare(){
        if(idx > sharesets.length - 1) {
            //shareset.shares = _(shareset.shares).uniq();
            console.log('update complete');
            return;
        }

        var ss = sharesets[idx];

        Share.find({shareset:ss._id}, function(err, cursor){
            cursor.each(function(err,share){
                if(err) throw err;
                if(!share){
                    idx++;
                    Shareset.save(ss, function(err, saved){
                        if(err) throw err;
                        console.log('-----  saved',ss.shares.length);
                        findShare();
                    });
                    return;
                }
                ss.shares.push(share._id);
            })
        });
    }

    function start(){
        Shareset.find({}, function(err, results) {
            results.each(function(error, shareset){
                if(!shareset) {
                  findShare();
                  return;
                }
                shareset.shares = shareset.shares || [];
                console.log('%1\t%3\t%2',shareset._id, shareset.subject, shareset.shares.length);
                if(shareset.shares.length) return;
                sharesets.push(shareset);
            });
          // Let's close the db
        });
    };

});
