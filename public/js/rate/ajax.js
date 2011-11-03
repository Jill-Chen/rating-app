KISSY.add('rate/ajax', function(S, FormError){
    var $ = S.all;
    var actions = {
        redirect : function(res){
            location.href = res.redirect
        }
    };

    $('form.ajax-form').each(function(et){
        $this = $(this);
        var formerror = new FormError({
            template : $('#temp-errors').html(),
            container : $this.one('.error-holder')
        });
        $this.on('submit',function(ev){
            ev.preventDefault();
            S.ajax({
                url : $this.attr('action'),
                type : $this.attr('method'),
                data : S.io.serialize($this),
                dataType: 'json',
                success : function(res){
                    if(res.errors){
                        formerror.render({
                            errors : res.errors
                        });
                        return;
                    }
                    //if(actions[res.action]){
                        //actions[res.action](res);
                    //}
                }
            });
        });
    });

    $('.ajax-btn').each(function(btn){
        var $t = $(this),
            url = $t.attr('href'),
            type;

        if(url && !$t.attr('data-url')){
            $t.attr('data-url', url);
        }
        url = $t.attr('data-url');
        type = $t.attr('data-type');
        if(url && type){
            $t.on('click',function(ev){
                ev.preventDefault();
                S.ajax({
                    url : $t.attr('data-url'),
                    type : $t.attr('data-type'),
                    dataType : 'json',
                    success : function(res){
                        if(res.errors){
                            return;
                        }
                        if(actions[res.action]){
                            actions[res.action](res);
                        }
                    }
                });
            });
        }
    });
}, {
    requires : ['rate/form-error']
});
