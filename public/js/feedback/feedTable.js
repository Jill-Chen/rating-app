KISSY.ready(function(S) {
        var DOM = S.DOM,Event = S.Event;
        var papers = DOM.query('fieldset');
        var current = 0,end = papers.length;
        DOM.hide('#submit-form');
        DOM.hide('#scroller-prev');
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
        });
        Event.on('#scroller-prev','click',function(e){
            if(current>=0){
                DOM.show(papers[current-1]);
                current--;
            }
            if(current != end-1){
                DOM.hide('#submit-form');
                DOM.show('#scroller-next');
            }
            if(current == 0){
                DOM.hide('#scroller-prev');
                DOM.show('#submit-back');	
            }
        });
    });