KISSY.add('rate/home',function(S){
    var $ = S.all;

    var temp = S.one('#temp-tags')[0].innerHTML;
    var tagsTmpl = new S.Template(temp);

    S.io({
        url : '/json/tags',
        dataType : 'json',
        type : 'get',
        success : function(data){
            $('#tags .bd').html(tagsTmpl.render(data));
        }
    });
});
