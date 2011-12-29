KISSY.add('rate/share',function(S){
    S.ready(function(){
        function toggleEditor(elcnt){
            elcnt.one('.editor').slideToggle(.2);
            elcnt.one('.bd').slideToggle(.2);
            elcnt.one('.ft').toggle();
            S.DOM.scrollTop(0);
        }

        S.all('div.content-editor').each(function(elcnt){
            elcnt.delegate('click','.edit',function(ev){
                toggleEditor(elcnt);
                ev.preventDefault();
            }).delegate('click','.toggle-tips', function(ev){
                elcnt.one('.tips-block').slideToggle(.2);
            });
            form = elcnt.one('form.editor-form');
            if(form){
                form.on('submit', function(ev){
                    ev.halt();
                    S.io({
                        url : form.attr('data-url'),
                        form : form,
                        type : form.attr('method'),
                        dataType : 'json',
                        success : function(data){
                            if(data.html){
                                elcnt.one('div.content-bd').html(data.html);
                                toggleEditor(elcnt);
                            }else{
                                alert('保存出错，下次再试');
                            }
                        }
                    })
                });
            }
        });
    });
},{
    requires : ['sizzle']
});
