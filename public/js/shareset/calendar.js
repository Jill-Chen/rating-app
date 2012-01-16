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
        month : null,
        parse : function(res){
            return res;
        }
    });

    var ListView = Backbone.View.extend({
        initialize : function(){
            this.template_list = $('#template-list').html();
            this.template_shareset = $('#template-list-shareset').html();
        },
        show : function(){
            $(this.el).show();
        },
        hide : function(){
            $(this.el).hide();
        },
        events : { },
        className : function(){},
        render : function(sharesets){
            var list = sharesets.toJSON();
            _(list).each(function(d){
                d.date = moment(d.date).format('YYYY年MM月DD日');
            });
            $(this.el).html(mustache.to_html(this.template_list, {
                list : list
            },
            {
               sharesets : this.template_shareset
            }))
        }
    });

    var CalendarView = Backbone.View.extend({
        initialize : function(option){
            this.template = $('#template-calendar').html();
            this.template_shareset = $('#template-shareset').html();
            this.calendarHd = new CalendarHdView();
        },
        show : function(){
            $(this.el).show();
            this.calendarHd.show();
        },
        hide : function(){
            $(this.el).hide();
            this.calendarHd.hide();
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
                if(today.year() === d.year() && today.month() === d.month() && today.date() === d.date()){
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

            var viewData = {
                weeks : weeks
               ,month : start.format('YYYY 年 M 月')
               ,prevMonth : start.add('M', -1).format('YYYY-MM')
               ,nextMonth : start.add('M',2).format('YYYY-MM')
            };

            $(self.el).html(mustache.to_html(self.template, viewData));

            this.calendarHd.render(viewData);


            setTimeout(function(){
                _(data).each(function(d){

                    var clsDate = moment(d.date).format('YYYY-MM-DD'),
                        elLI = $(mustache.to_html(self.template_shareset, d)),
                        elUL = $(self.el).find('.dt-'+clsDate+' ul');

                    elUL.append(elLI);
                });
            },0)

            return self;
        }
    });

    var CalendarHdView = Backbone.View.extend({
        el : '#calendar-hd',
        show : function(){
            $(this.el).show();
        },
        hide : function(){
            $(this.el).hide();
        },
        render : function(data){
            $(this.el).find('span.title').html(data.month);
            $(this.el).find('.prevMonth').attr('href', "#m/"+data.prevMonth);
            $(this.el).find('.nextMonth').attr('href', "#m/"+data.nextMonth );
        }
    });

    var AppRouter = Backbone.Router.extend({
        initialize : function(){
            var sharesets = this.sharesets = new Sharesets();
            var calendarView = this.calendarView = new CalendarView();
            var listView = this.listView = new ListView();

            sharesets.bind('change',function(){
                alert('change');
            });

            sharesets.bind('reset',function(x,y){
                if(this.month){
                    calendarView.render(this);
                }else{
                    listView.render(this);
                }
            });

            $('#cal-container').append(this.calendarView.el);
            $('#list-container').append(this.listView.el);
        },
        routes : {
            'm/:month' : "month",
            '' : 'month',
            'list' : 'list',
            'list/:name' : 'listByName'
        },
        url : '/shareset',
        month : function(month){
            this.calendarView.show()
            this.listView.hide();
            $('#viewswitch .v-c').addClass('active');
            $('#viewswitch .v-l').removeClass('active');
            if(!month){
                month = moment().format('YYYY-MM');
            }
            this.sharesets.month = month;
            this.sharesets.fetch({
                data : {
                    month : month
                }
            });
        },
        list : function(){
            this.sharesets.month = null;
            this.sharesets.fetch({});
            this.calendarView.hide()
            this.listView.show();
            $('#viewswitch .v-l').addClass('active');
            $('#viewswitch .v-c').removeClass('active');
        },
        listByName : function(name){
            this.calendarView.hide()
            this.listView.show();
            $('#viewswitch .v-l').addClass('active');
            $('#viewswitch .v-c').removeClass('active');
            this.sharesets.month = null;
            this.sharesets.fetch({
                data : {
                    name : name
                }
            });
        }
    });


    //start
    var router = new AppRouter();
    Backbone.history.start();
});
