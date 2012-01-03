define(function(require, exports, module){
    var Backbone = require('backbone'),
        moment = require('moment'),
        _ = require('underscore'),
        mustache = require('mustache'),
        $ = require('jquery');

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
            this.template_shareset = $('#template-shareset').html();
            this.app = option.app;
        },

        events : {
            'click .day' : 'dayclick'
        },

        dayclick : function(ev){
            var et = $(ev.target),
                fullDate;

            if(!et.hasClass('day')){
                return;
            }

            fullDate = et.attr('data-dt');

            if(!et.hasClass('current')){
                location.hash = 'm/'+fullDate.substr(0,7);
                return;
            }
            if(et.hasClass('day')){
                location.href='/shareset/new?date='+fullDate
                return;
            }
        },

        className : 'calendar-tbl',
        render : function(sharesets){
            var self = this
               ,month = sharesets.month
               ,days = []
               ,start = moment(month, 'YYYY-MM')
               ,end = moment(start.valueOf()).add('M',1)
               ,today = moment()
               ,firstMonday = moment(start.valueOf()).add('days', - start.day())
               ,lastSunday = moment(end.valueOf()).add('days', 6 - end.add('days', -1).day())
               ,data = sharesets.toJSON()
               ,d = firstMonday;


            _(lastSunday.diff(firstMonday,'days')).times(function(){
                var cls = ''
                if(today.month() === d.month() && today.date() === d.date()){
                    cls += ' today'
                }
                if(d.month() === start.month()){
                    cls += ' current';
                };
                days.push({
                    inMonth : d.diff(start,'months') === 0
                   ,fullDate : d.format('YYYY-MM-DD')
                   ,cls : cls
                   ,date : d.date()
                });
                d = moment(d.valueOf()).add('days',1);
            });
            var weeks = [];
            _(days).each(function(d,idx){
                var weekday = idx % 7,
                    weekidx = Math.floor(idx/7);
                if(weekday === 0){
                    weeks.push({days:[]});
                }

                weeks[weekidx].days.push(d);
            });
            $(self.el).html(mustache.to_html(self.template, {
                weeks : weeks
               ,month : start.format('YYYY 年 M 月')
               ,prevMonth : start.add('M', -1).format('YYYY-MM')
               ,nextMonth : start.add('M',2).format('YYYY-MM')
            }));
            setTimeout(function(){
                _(data).each(function(d){

                    var clsDate = moment(d.date).format('YYYY-MM-DD');
                    clsDate = '.dt-'+clsDate+' ul';
                    console.log(clsDate);

                    var elLI = $(mustache.to_html(self.template_shareset, d));
                    var elUL = $(self.el).find(clsDate);
                    elUL.append(elLI);
                });
            },0)

            //$(self.el).slideUp(function(){
            //}).slideDown();



            return self;
        }
    });

    var AppRouter = Backbone.Router.extend({
        initialize : function(){
            var sharesets = this.sharesets = new Sharesets();
            var calendarView = this.calendarView = new CalendarView({
                app : this
            });

            sharesets.bind('change',function(){
                alert('change');
            });
            sharesets.bind('reset',function(x,y){
                calendarView.render(this);
            });

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
            this.sharesets.month = month;
            this.sharesets.fetch({
                data : {
                    month : month
                }
            });
        }
    });


    //start
    var router = new AppRouter();
    Backbone.history.start();
});
