define(function(require, exports, module){
    var Backbone = require('backbone'),
        moment = require('moment'),
        _ = require('underscore'),
        jquery = require('jquery');

    var Shareset = Backbone.Model.extend({
        urlRoot : '/shareset'
    });

    var Sharesets = Backbone.Collection.extend({
        model : Shareset,
        url : '/shareset',
        month : moment().format('YYYY-MM'),
        parse : function(res){
            //_(res).each(function(d){
                //d.id = d._id
            //});
            return res;
        }
    });

    var calendarView = Backbone.View.extend({ });

    var AppRouter = Backbone.Router.extend({
        initialize : function(){
            sharesets = new Sharesets();

            sharesets.bind('change',function(){
                alert('changeed');
            });
            sharesets.bind('reset',function(){
                alert('changeed');
            });
        },
        routes : {
            'm/:month' : "month",
            '' : 'month'
        },
        url : '/shareset',
        month : function(month){
            console.log('router month', month);
            sharesets.month = month;
            sharesets.fetch();
        }
    });


    //Backbone.history.start({
        //pushState : true
    //});



    //start
    var router = new AppRouter();
    //router.navigate('m/2012');
    Backbone.history.start();
    console.log(Backbone.history);
});
