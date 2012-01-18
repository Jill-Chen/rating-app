KISSY.use('sizzle',function(S){	
	S.ready(function() {
        var DOM = S.DOM,Event = S.Event;
        var papers = DOM.query('fieldset');
        var current = 0,end = papers.length;
		var createNav = function(navNum){
			for(var j=0;j<navNum;j++){
				DOM.append('<li>'+j+'</li>','ul.switch-nav');
			}
			DOM.css(DOM.children('ul.switch-nav')[0],'background','red');
		}
		var changeNav = function(current){
			DOM.css(DOM.children('ul.switch-nav'),'background','#000');
			DOM.css(DOM.children('ul.switch-nav')[current],'background','red');
		}
		var initPage = function(listNum){
			DOM.hide('#submit-form');
			DOM.hide('#scroller-prev');
			DOM.css('.ks-switchable-content','height','400px');
			createNav(listNum);
			Event.on('#scroller-next','click',function(e){
				for(var i=0;i<options.length;i++){
					if(DOM.query('.ctl-score:eq('+i+')>:checkd') == 0){
						DOM.css(DOM.children(papers[i])[0],'color','red');
						return;
					}
				}
				if(current < end){
					DOM.hide(papers[current]);
					current++;
					DOM.show('#scroller-prev');
					DOM.hide('#submit-back');
				}
				if(current == end-1){
					DOM.show('#submit-form');
					DOM.hide(e.currentTarget);
				}
				DOM.css('.ks-switchable-content','height','590px');
				changeNav(current);
			});
		}
		initPage(end);
    });
});