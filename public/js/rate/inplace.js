KISSY.add('rate/inplace',function(S){
    var $ = S.all;
    $('.editable').each(function(el){
        var $et = $(this);
    });
    function edit(target){
        var $t = $(target);
        var type = $t.attr('data-type')||'input';
        var text = S.trim($t.text());
        var input = $(S.DOM.create("<"+type+">")).val(text).width($t.width());
        $t.attr('data-cache', text).html('').append(input);
    }
    $(document.body).delegate('click','.editable', function(ev){
        edit(ev.target);
    });
});
