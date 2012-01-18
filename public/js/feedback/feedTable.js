KISSY.ready(function(S) {
        var DOM = S.DOM,Event = S.Event;
        var papers = DOM.query('fieldset');
        var current = 0,end = papers.length;
        DOM.hide('#submit-form');
        DOM.hide('#scroller-prev');
        DOM.css('.ks-switchable-content','height','400px');
        Event.on('#scroller-next','click',function(e){
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
			
        });
    });