KISSY.add('rate/share',function(S,O){
    var uploader = null;
    window.uploadCallback = function(files){
        var text = S.one('.editor textarea')
        var old = text.val();
        var file = files.uploader;
        var markdown = '';
        if(!file || file.size === 0 ){
            alert('请选择文件');
            return;
        }
        file.path = file.path.replace(/^public/,'');
        file.nameEscaped = file.name.replace(/([\.\-\+\#\`\_\*\\\{\}\(\)\[\]])/g,'\\$1');

        if(/^image/.test(file.type)){
            markdown = S.substitute('\n\n![{nameEscaped}]({path} "{name}")', file);
        }else{
            markdown = S.substitute('\n\n文件下载: [{name}]({path}) - {length}B', file);
        }
        text.val(old+markdown)
        uploader.hide();
    }

    S.ready(function(){

        uploader = new O({
            content : S.one('#template-uploader').html(),
            elCls : 'uploader',
            visible : false,
            align : {points:['cc','cc']}
        });
        uploader.render()
        uploader.get('contentEl').delegate('click','.close-ov',function(ev){
                uploader.hide();
                ev.halt();
            });

        function toggleEditor(elcnt){
            elcnt.one('.editor').slideToggle(.2);
            elcnt.one('.bd').toggle();
            elcnt.one('.ft').toggle();
            S.DOM.scrollTop(0);
        }

        S.all('div.content-editor').each(function(elcnt){

            elcnt.delegate('click','.edit',function(ev){
                toggleEditor(elcnt);
                ev.preventDefault();
            }).delegate('click','.toggle-tips', function(ev){
                elcnt.one('.tips-block').slideToggle(.2);
            }).delegate('click','.show-uploader',function(ev){
                ev.halt();
                uploader.show();
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
    requires : ['overlay','sizzle']
});
