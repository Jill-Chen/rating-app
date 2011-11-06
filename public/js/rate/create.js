KISSY.add('rate/create',function(S){
    var $ = S.all;

    var temp = S.one('#temp-tags')[0].innerHTML;
    var tagsTmpl = new S.Template(temp);
    var tagsel = S.one('#tagfield');

    S.io({
        url : '/json/tags',
        dataType : 'json',
        type : 'get',
        success : function(data){
            S.log(data);
            tagsel.html(tagsTmpl.render(data));
        }
    });

    tagsel.delegate('click', '.tag', function(ev){
        ev.halt();
        var et = S.one(ev.target),
            elinput = S.one('#input_tags'),
            eltext = elinput.val().replace(/ ?$/,'');
        if(eltext.length > 0){
            eltext += ' ';
        }
        elinput.val(eltext + et.text());
        elinput[0].focus();
    });
},{
    requires : ['template']
});
