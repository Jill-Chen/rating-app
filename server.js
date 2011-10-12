var app = require('./app');
var type = process.argv[2];
var configs = {
    dev : {
        port : 3002
    },
    normal : {
        port : 80
    }
};
var config = configs[type] || configs['normal'];
console.log(config);
app.listen(config.port);
console.log('Express server listening on port %d', app.address().port);
