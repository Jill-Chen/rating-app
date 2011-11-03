define(function(require,exports,module){
    var $ = require('jquery');
    $('form.ajax-form').each(function(et){
        $this = $(this);
        $this.bind('submit',function(ev){
            ev.preventDefault();
            $.ajax({
                url : $this.attr('action'),
                type : $this.attr('method')
            }).success(function(res){
                console.log(res);
            });
        });
    });
});
