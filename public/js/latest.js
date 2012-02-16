define(function(require, exports, module){
    var mustache = require('mustache'),
        $ = require('jquery');
    
    $.ajax({
        url : '/share?size=8',
        dataType : 'json',
        success : function(data){
            this.template = $('#template-latest').html();
            var el = $('#Latest');
            el.html(mustache.to_html(this.template,{
                list : data
            }));
        }
    });
});
