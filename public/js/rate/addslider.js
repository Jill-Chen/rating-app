KISSY.add('rate/addslider',function(S){
    var elslider = S.all('.slideshare');
    elslider.delegate('click','.slider-edit',function(){
        elslider.one('.bd').html(S.Template(S.one('#template-add-slider')).render({}));
    });
},{
    require : ['tempalte']
});
