KISSY.use('sizzle',function(S){	
	S.ready(function() {
        var DOM = S.DOM,Event = S.Event,$ = S.all;
        var papers = $('fieldset');
        var current = 0,end = papers.length;
        var optionLength = 10,optionSize = [2,4];

		var createNav = function(navNum){
			DOM.hide('#submit-form');
			DOM.css('.ks-switchable-content','height','440px');
            DOM.css('.ctl-score td','cursor','pointer');
            for(var j=0;j<navNum;j++){
				$('ul.switch-nav').append('<li>'+j+'</li>');
			}
			DOM.css(DOM.children('ul.switch-nav')[0],'background','red');
		}

		var changeNav = function(current){
			DOM.css(DOM.children('ul.switch-nav'),'background','#000');
			DOM.css(DOM.children('ul.switch-nav')[current],'background','red');
		}

        var optCheck = function(cur,tag){
            var chk = $('fieldset:eq('+cur+') :checked').length,
                baseline = $('fieldset:eq('+cur+') .ctl-score').length;
            if(cur == 0){
                if(chk<optionSize[0]){
                    for(var i=0;i<baseline;i++){
                        if($('fieldset:eq('+cur+') .ctl-score:eq('+i+') :checked').length == 0){
                            DOM.css($('fieldset:eq('+cur+') .clearfix:eq('+i+') label'),'color','red');
                        }
                    }
                    return;
                } 
            }else {
                if(chk<optionSize[1]){
                    for(var i=0;i<baseline;i++){
                        if($('fieldset:eq('+cur+') .ctl-score:eq('+i+') :checked').length == 0){
                            DOM.css($('fieldset:eq('+cur+') .clearfix:eq('+i+') label'),'color','red');
                        }
                    }
                    return;
                }
            }
            if(current < end-1){
                DOM.hide(papers[cur]);
                DOM.show(papers[cur+1]);
                current++;
            }
            if(current == end-1 && tag == 0){
                DOM.show('#submit-form');
                DOM.hide('#scroller-next');
            }
            if(current == end-1 && tag == 1){
                $('form.feedback')[0].submit();
            }

            DOM.css('.ks-switchable-content','height','630px');
        }

		var initPage = function(listNum){
			createNav(listNum);
			Event.on('#scroller-next','click',function(e){
				console.log(current);
                optCheck(current,0);
				//changeNav(current);
			});
            Event.on('#submit-form','click',function(e){
                e.preventDefault();
                optCheck(end-1,1);
            });
            $('.ctl-score td').on('click',function(e){
                DOM.prop(DOM.children(this)[0],'checked','checked');
            });
		}
		initPage(end);
    });
});
