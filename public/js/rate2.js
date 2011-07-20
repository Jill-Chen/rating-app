KISSY.ready(function(S){
    var ratedata = [];

    S.all(".rating-item").on("click",function(ev){
        ev.preventDefault();
        var et = ev.target,
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

    S.one("#rate-submit").on("click",function(ev){
        console.log(ratedata);
        lock = false;
        gotoMain();
    });
});
