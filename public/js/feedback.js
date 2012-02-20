define(function(require,exports, module){
    var $ = require('jquery'),
        _ = require('underscore'),
        M = require('mustache');

    var font0 = '40px _sans',
        font1 = '20px _sans',
        font2 = '12px _sans',
        black = '#000',
        gray = '#666',
        lightGray = '#BBB';

    function calculate(fb){
        //console.log(fb);
        var len = fb.rates.length,
            sum = _(fb.rates).reduce(function(memo,num){
                var n = Number(num);
                if(isNaN(n)){
                    len -= 1;
                    n = 0;
                }
                return memo + n;
            },0);
        //console.log(len,sum);
        fb.score = len<=0?'没有数据':(sum/len).toFixed(2);
        return fb.score;
    }

    function drawResult(feedbacks){
        var toShareset = [],
            sharesets = {
                shareset_general : {
                    title : '整体满意度',
                    rates : []
                },
                shareset_subject : {
                    title : '话题安排和栏目设置的满意度',
                    rates : []
                }
            },
            shares  = {},
            drawObj = {
                num : feedbacks.length,
                sharesets : sharesets,
                shares : shares
            };

        _(feedbacks).each(function(fb){
            sharesets.shareset_general.rates.push(fb.toShareset.rateGeneral);
            sharesets.shareset_subject.rates.push(fb.toShareset.rateSubject);
            _(fb.toShares).each(function(item){
                if(!(item.share in shares)){
                    shares[item.share] = {
                        title : item.title,
                        authors : item.authors,
                        rates : {
                            slider : {
                                title : '幻灯片及分享材料',
                                rates : []
                            },
                            timeControl : {
                                title : '时间控制',
                                rates : []
                            },
                            speak : {
                                title : '演讲技巧',
                                rates : []
                            },
                            topic : {
                                title : '话题与分享内容',
                                rates : []
                            }
                        }
                    };
                }
                var rates = shares[item.share].rates;
                rates.slider.rates.push(item.rateSlider);
                rates.speak.rates.push(item.rateSpeak);
                rates.topic.rates.push(item.rateSpeak);
                rates.timeControl.rates.push(item.rateTimeControl);
            });
        });
        _(drawObj.sharesets).each(calculate)
        _(drawObj.shares).each(function(share){
            _(share.rates).each(calculate);
        });

        draw(drawObj);
    }

    function drawRates(fb,ctx,pLeft,pTop,bWidth,bHeight){
        var len = fb.rates.length,
            bar_height = (bHeight + 1)/len - 1,
            sTop;

        ctx.font = font1;
        ctx.fillStyle = black;
        ctx.fillText(fb.title,pLeft,pTop + 20);
        pTop += 40;

        sTop = pTop+20;

        _(fb.rates).each(function(num,nidx){
            ctx.fillStyle = lightGray;
            ctx.fillRect(pLeft, pTop + nidx*(bar_height+1), bWidth * num/ 10, bar_height);
        });
        pTop += bHeight;

        //draw Score
        ctx.fillStyle = gray;
        ctx.font = font0;
        ctx.fillText(fb.score, pLeft+10, sTop + 20);

        pTop += 10;
        return pTop;
    }

    function drawShare(share,ctx,pLeft,pTop,bWidth,bHeight){
        ctx.fillStyle = '#f00';
        ctx.font = font1;
        ctx.fillText(share.authors + ' : ' + share.title, pLeft, pTop + 30);
        pTop += 40;
        _(share.rates).each(function(fb){
            pTop = drawRates(fb,ctx,pLeft,pTop,bWidth,bHeight);
        });
        return pTop;
    }

    function draw(obj){
        console.log(obj);
        var canvas = $('#chart'),
            ctx = canvas[0].getContext('2d'),
            pLeft = 80,
            pTop = 10,
            bWidth = 400,
            bHeight = 50;

        //total
        ctx.font = font0;
        ctx.fillStyle = '#000';
        ctx.fillText(obj.num, 20,40);
        ctx.font = font2;
        ctx.fillStyle = gray;
        ctx.fillText('次反馈',20,60);


        //toShareset
        ctx.fillStyle = lightGray;
        _(obj.sharesets).each(function(fb,idx){
            pTop = drawRates(fb,ctx,pLeft,pTop,bWidth,bHeight);
        });
        _(obj.shares).each(function(share,idx){
            pTop = drawShare(share,ctx,pLeft,pTop,bWidth,bHeight);
        });


        if(canvas[0].height != pTop+20){
            canvas[0].height = pTop + 20;
            draw(obj);
        };
    };
    exports.init = function(url){
        $.ajax({
            url : url,
            dateType : 'json',
        }).success(function(data){
            console.log('ajax done',data);
            drawResult(data.feedbacks);
        });;
        $('#toggle-chart').on('click',function(ev){
            ev.preventDefault();
            $('#chart-container').toggle();
        });
    };
});
