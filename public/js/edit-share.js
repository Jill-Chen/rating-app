define(function(require, exports){
    var $ = require('jquery');

    //Insert the tag;
    $('#tags').delegate('.tag', 'click', function(ev){
        var elIn = $('#tags-in');
        elIn.val(elIn.val().replace(/\,?$/, ', ' + $(ev.target).html()));
    });
});
