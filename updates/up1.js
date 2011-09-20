
var mongod = require('mongodb');
var _ = require("underscore");

db = new mongod.Db(
    'firebird',
    new mongod.Server('127.0.0.1', 27017),
    {
        native_parser:false
    }
);

db.open(function(err,db){
    db.collection('rate', function(err, collection){
        collection.find({},function(err, cur){
            cur.each(function(err,doc){
                if(!doc){
                    console.log('done');
                    return;
                }
                doc.title = decodeURIComponent(doc.title);

                doc.authors = _.map(doc.authors, function(author){
                    return decodeURIComponent(author);
                });
                doc.tags = _.map(doc.tags, function(item){
                    return decodeURIComponent(item);
                });
                console.log(doc.title)
                console.log(doc.authors)
                console.log(doc.tags)
                collection.save(doc);
            })
        });
    });
});
