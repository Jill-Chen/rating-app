KISSY.add('rate/app',function(S){
    S.ready(function(){
        var obj = {
            url : encodeURIComponent(location.href)
        }
        S.all('.login-url').each(function(link){
            var href = link.attr('href');
            link.attr('href', S.substitute(href,obj));
        });
    });
});
