define(function(require, exports, module){

    var Backbone = require('backbone'),
        moment = require('moment'),
        _ = require('underscore'),
        mustache = require('mustache'),
        $ = require('jquery');

    var Share = Backbone.Model.extend({
        urlRoot : '/share'
    });


    var Shares = Backbone.Collection.extend({
        model : Share,
        url : '/share',
        parse : function(res){
            return res;
        }
    });

    var ShareListView = Backbone.View.extend({
        initialize : function(option){
            this.template = $('#template-list').html();
            this.app = option.app;
        },

        events : {
        },
        className : 'explore',
        render : function(shares){
            var self = this,
                el = $(self.el);

            _(shares).each(function(share){
                share.authors = share.authors.join(', ');
            });

            el.html(mustache.to_html(self.template, {
                list : shares
            }));

            return self;
        }
    });

    var TagsView = Backbone.View.extend({
        initialize : function(app){
            this.app = app;
            this.template = $('#template-tags').html();
        },
        className : 'tags',
        render : function(tags){
            $(this.el).html(mustache.to_html(this.template, {
                tags : tags
            }));
        }
    });

    var TagQueryView = Backbone.View.extend({
        initialize : function(app){
            this.app = app;
            this.template = $('#template-tagquery').html();
        },
        className : 'tags-query',

        render : function(tag){
            $(this.el).html(mustache.to_html(this.template, {
                tag : tag
            }));
        }
    });

    var AppRouter = Backbone.Router.extend({
        initialize : function(){
            var shares = this.shares = new Shares();

            var sharelistView = this.sharelistView = new ShareListView({
                app : this
            });
            var tagsView = new TagsView({
                app : this
            });
            var tagQueryView = this.tagQueryView = new TagQueryView({
                app : this
            });

            shares.bind('change',function(){
                alert('change');
            });

            shares.bind('reset',function(x,y){
                sharelistView.render(this.toJSON());
            });

            $.ajax({
                url : '/json/tags',
                dataType : 'json'
            }).success(function(tags){
                tagsView.render(tags)
            });


            $('#Explore').append(sharelistView.el);
            $('#Tags').append(tagsView.el);

        },
        routes : {
            '' : 'index',
            'tags/:tag' : 'tags'
        },
        index : function(){
            this.shares.fetch();
            $('#Query').hide();
        },
        tags : function(tag){
            this.tagQueryView.render(tag);
            $('#Query').append(this.tagQueryView.el).show();
            this.shares.fetch({
                data : 'tags=' + tag
            });
        }
    });


    //start
    var router = new AppRouter();
    Backbone.history.start();
});
