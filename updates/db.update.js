var mongodb = require('mongodb'),
    Db = mongodb.Db,
    Server = mongodb.Server;
var moment = require('moment');
var _ = require('underscore');

var tf = 'YYYY-MM-DD HH:mm:ss';

var client = new Db('ratting', new Server("127.0.0.1", 27017, {}));

client.open(function(err, p_client) {
  client.collection('sharesets', function(err, collection){
    collection.find({}, function(err, results) {
        results.each(function(error, doc){
            if(!doc) {
              client.close();
                return;
            }

            console.log(doc.startTime);
            console.log(moment(doc.startTime).format(tf))
            console.log(doc.endTime);

            if(typeof doc.startTime === 'string'){
                return;
            };

            var date = moment(doc.startTime.getTime());

            date.hours(0).minutes(0).seconds(0);
            console.log(date.format(tf));
            doc.date = date.native();

            doc.startTime = moment(doc.startTime).format('HH:mm');
            doc.endTime = moment(doc.endTime).format('HH:mm');


            console.log(doc);
            console.log('---')

            collection.save(doc, function(err, saved){
                console.log('saved');
            });
        });
      // Let's close the db
    });

  });
});
