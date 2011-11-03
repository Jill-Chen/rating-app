KISSY.add('rate/app',function(S){
    var $ = S.all;
    return {
        nav : function(name){
            var navitem = $('#nav-'+name);
            if(navitem) navitem.addClass('active');
        },
        getQRCode : function(el, data){
            var elem = S.one(el)
            if(!elem || !data){
                return;
            }

            S.io({
                url : '/qrcode',
                data : { url : data },
                dataType : 'json',
                type : 'get',
                success : function(data){
                    if(data.isSuccess){
                        var img = new Image();
                        img.src = data.dataURL;
                        elem.append(img);
                    }
                }
            });
        }
    };
}
);
