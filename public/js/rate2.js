KISSY.ready(function(S){
    var Dom = S.DOM;
    var ratedata = {
    };

    S.all(".rating-item").on("click",function(ev){
        ev.preventDefault();
        var et = S.one(ev.target),
            ulid,
            rateclass;

        var et = ev.target,
            prefix = "r_",
            num = 0,
            match;

        if(et[0].tagName.toLowerCase() === "a"){
            ulid = et.parent().parent()[0].id;
            match = et.parent()[0].className.match(/(\d+)/gi);
            num = parseInt(match[0]);

            if(ulid.length > 0){
                ratedata[ulid] = num;
            }

            rateclass = prefix+num;
            this.removeClass(this.attr("data-old"));
            this.attr("data-old", rateclass);
            this.addClass(rateclass);
        }


    });

    S.one("#rateform").on("submit",function(ev){
        ev.halt();
        var form = S.one("#rateform");
        S.each(ratedata,function(v,k){
            form.append(Dom.create("<input type=\"hidden\">",{
                "name" : k,
                "value": v
            }));
        });
        form[0].submit();
    });
});
