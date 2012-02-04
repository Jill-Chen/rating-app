var redis = require('redis'),
    client = redis.createClient(),
    async = require('async')
    modules = require('../modules/'),
    _ = require('underscore'),
    stores = {};


var Share = modules.Share,
    ShareSet = modules.ShareSet;

client.on('error',function(err){
    throw new Error(err);
});

function initTags(fn){
    Share.distinct('tags', {}, function(err, tags){
        if(err) return fn(err);
        async.map(tags, function(tag, cb){
            Share.count({tags : tag}, function(err, count){
                if(err) return cb(err);
                cb(null, {
                    tag : tag,
                    count : count
                });
            });
        }, function(err, results){
            if(err) return fn(err);
            var hash = {};
            _(results).each(function(v,k){
                hash[v.tag] = v.count;
            });
            fn(null, hash);
        });
    });
}

function initNames(fn){
    ShareSet.distinct('name', {}, function(err, names){
        if(err) return fn(err);
        async.map(names, function(name, cb){
            ShareSet.count({name : name}, function(err, count){
                if(err) return cb(err);
                cb(null, {
                    name : name,
                    count : count
                })
            });
        }, function(err, results){
            if(err) return fn(err);
            var hash = {};
            _(results).each(function(v,k){
                hash[v.name] = v.count;
            });
            fn(null, hash);
        });
    });
}

function RedisReset(fnInit, key, fn){
    fn = fn || function(){};
    fnInit(function(err, hash){
        if(err) return fn(err);
        client.hmset(key, hash);
        //24h
        client.expire(key, 60*60*24);
        fn(null, hash);
    });
}

function getAll(key, fnInit, fn){
    client.hgetall(key,function(err, caches){
        if(err) return fn(err);
        if(caches) {
            return fn(null, caches);
        }
        RedisReset(fnInit, key, fn);
    });
}


exports.getTags = function(fn){
    getAll('share-tags', initTags, fn);
};

exports.getNames= function(fn){
    getAll('shareset-names', initNames, fn);
}

RedisReset(initTags, 'share-tags', function(){
    exports.getTags(function(err, tags){
        if(err) throw err;
    });
});

RedisReset(initNames, 'shareset-names', function(){
    exports.getNames(function(err, tags){
        if(err) throw err;
    });
});
