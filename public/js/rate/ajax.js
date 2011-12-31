KISSY.add('rate/ajax', function(S, FormError){
    var $ = S.all;
    var actions = {
        redirect : function(res){
            if(!res.redirect){
                location.reload();
            }
            location.href = res.redirect
        }
    };

    $('form.ajax-form').each(function(et){
        $this = $(this);
        var formerror = new FormError($this);
        $this.on('submit',function(ev){
            formerror.removeAll();
            ev.preventDefault();
            S.ajax({
                url : $this.attr('action'),
                type : $this.attr('method'),
                data : S.io.serialize($this),
                dataType: 'json',
                success : function(res){

                    if(res.errors){
                        formerror.render(res.errors);
                    }

                    if(actions[res.action]){
                        actions[res.action](res);
                    }
                }
            });
        });
    });

    $('.ajax-btn').each(function(btn){
        var $t = $(this),
            url = $t.attr('href'),
            type,
            cfm;

        if(url && !$t.attr('data-url')){
            $t.attr('data-url', url);
        }
        url = $t.attr('data-url');
        type = $t.attr('data-type');
        cfm = $t.attr('data-confirm');


        if(url && type){
            $t.on('click',function(ev){
                ev.preventDefault();
                if(cfm){
                    if(!confirm(cfm)) return;
                }
                S.ajax({
                    url : $t.attr('data-url'),
                    type : $t.attr('data-type'),
                    dataType : 'json',
                    cache : false,
                    success : function(res){
                        if(res.errors.length && res.errors[0]){
                            alert(res.errors[0].type);
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
