define(function(require, exports, module){
    var Backbone = require('backbone'),
        moment = require('moment'),
        _ = require('underscore'),
        mustache = require('mustache'),
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

    var CalendarView = Backbone.View.extend({
        initialize : function(option){
            this.template = $('#template-calendar').html();
        },
        className : 'calendar-tbl',
        render : function(month){
            var days = [];
            var start = moment(month, 'YYYY-MM');
            var end = moment(start.valueOf()).add('M',1);
            var today = moment();
            var firstMonday = moment(start.valueOf()).add('days', - start.day());
            var lastSunday = moment(end.valueOf()).add('days', 6 - end.add('days', -1).day());

            var d = firstMonday;
            _(lastSunday.diff(firstMonday,'days')).times(function(){
                days.push({
                    inMonth : d.diff(start,'months') === 0
                   ,fullDate : d.format('YYYY-MM-SS')
                   ,date : d.date()
                });
                d = moment(d.valueOf()).add('days',1);
            });
            $(this.el).html(mustache.to_html(this.template, {days : days}));
            return this;
        }
    });

    var AppRouter = Backbone.Router.extend({
        initialize : function(){
            var sharesets = this.sharesets = new Sharesets();

            sharesets.bind('change',function(){
                alert('changeed');
            });
            sharesets.bind('reset',function(){
                alert('changeed');
            });

            this.calendarView = new CalendarView();
            $('#cal-container').append(this.calendarView.el);
        },
        routes : {
            'm/:month' : "month",
            '' : 'month'
        },
        url : '/shareset',
        month : function(month){
            if(!month){
                month = moment().format('YYYY-MM');
            }
            this.calendarView.render(month);
            //sharesets.fetch();
        }
    });


    //start
    var router = new AppRouter();
    Backbone.history.start();
});
