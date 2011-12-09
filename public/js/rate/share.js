KISSY.add('rate/share',function(S){
    S.ready(function(){
        S.all('div.content-editor').each(function(elcnt){
            elcnt.delegate('click','.edit',function(ev){
                ev.preventDefault();
                elcnt.one('.editor').slideToggle(.2);
                elcnt.one('.bd').slideToggle(.2);
                elcnt.one('.ft').toggle();
                S.DOM.scrollTop(0);
            }).delegate('click','.toggle-tips', function(ev){
                elcnt.one('.tips-block').slideToggle(.2);
            });
        });
    });
},{
    requires : ['sizzle']
});
