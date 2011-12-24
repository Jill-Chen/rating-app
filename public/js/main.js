seajs.config({
    alias : {
        'jquery' : 'jquery/1.7.1/jquery',
        'json' : 'json/1.0.1/json',
        'es5-safe' : 'es5-safe/0.9.2/es5-safe',
        'underscore' : 'underscore/1.2.3/underscore',
        'mustache' : 'mustache/0.4.0/mustache',
        'backbone' : 'backbone/0.5.3/backbone',
        'moment' : 'moment/1.2.0/moment'
    },
    preload : [
        Function.prototype.bind?'':'es5-safe',
        this.JSON?'':'json'
    ],
    debug : 'true'
});
