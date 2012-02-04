define(function(require, exports){
    var $ = require('jquery'),
        mustache = require('mustache');

    var tmpl = $('#tmpl-tags').html();

    $.ajax({
        url : '/json/tags',
        dataType : 'json'
    }).success(function(tags){
        $('#tags .bd').html(mustache.to_html(tmpl, {
            tags : tags
        }));
    })
});
