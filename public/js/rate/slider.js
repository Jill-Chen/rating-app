KISSY.add('rate/slider',function(S){
    var Event = S.Event,
        docbody = document.body,
        CLS_BAR = '.bar',
        CLS_HANDLE = '.handle';

    var Slider = function(config){
        var self = this;
        Slider.superclass.constructor.call(self, config);
        var elc = S.one(config.elem);
        self.elc= elc;
        self.elHandle = elc.one(CLS_HANDLE);
        self.elBar = elc.one(CLS_BAR);
        self.elInput = elc.one('input');
        self.elText = elc.one('.text');
        self.indicators = elc.one('.indicator').children();

        self.currentLevel = -1;

        self.h_width = self.elHandle.width();
        self.x_width = elc.width() - self.h_width;
        self.h_start = 0;
        self.touch_start = 0;
        self.c_start = elc.offset().left;

        self.elHandle.on('mousedown',function(ev){
            ev.preventDefault();
            self.touch_start = ev.pageX;
            self.h_start = parseInt(self.elHandle.css('left'),10);
            Event.on(docbody, 'mousemove', self.docOnMove, self);
            Event.on(docbody, 'mouseup', self.docOnMouseUp, self);
        });

        elc[0].addEventListener('touchstart',function(ev){
            ev.preventDefault();
            var touches = ev.touches;
            if(!touches.length){return;}
            self.touch_start = touches[0].pageX;
            self.h_start = parseInt(self.elHandle.css('left'),10);
        });

        elc[0].addEventListener('touchmove', function(ev){
            self.docOnMove(ev);
        });

        self.on('update', function(ev){
            var index = Math.round(ev.pecent * (self.indicators.length-1));
            if(index !== self.currentLevel) {
                self.currentLevel = index;
                self.fire('levelchange', {level : index});
            }
            self.elInput.val(ev.pecent * self.indicators.length);
        });
        self.on('levelchange', function(ev){
            var index = ev.level;
            var target = S.one(self.indicators[index]);
            var tip = target.attr('title');
            self.elText.html(tip);

            S.each(self.indicators, function(item, idx){
                console.log(idx, index);
                var node = S.one(item);
                if(idx !== index){
                    node.removeClass('current');
                }else{
                    node.addClass('current');
                }
            });
        });

    };

    S.augment(Slider, S.EventTarget, {
        setHandle : function(){
        },

        docOnMove : function(ev){

            var self = this;

            ev.preventDefault();
            var px = ev.pageX;

            if(ev.type === 'touchmove'){
                px = ev.touches[0].pageX;
            }

            var diff = px - self.touch_start;

            var targetx = self.h_start + diff;

            targetx = targetx < 0 ?
                0 : targetx > self.x_width ?
                    self.x_width : targetx;
            self.elHandle.css('left', targetx+ 'px');
            self.fire('update', {pecent : targetx / self.x_width});
        },

        docOnMouseUp : function(){
            var self = this;
            Event.remove(docbody, 'mousemove', self.docOnMove, self);
            Event.remove(docbody, 'mouseup', self.docOnMouseUp, self);
        }
    });
    S.extend(Slider, S.Base);

    Slider.ATTRS = {
        pecent : {
            value : 0,
            setter : function(value){
                if(value < 0){
                    value = 0;
                }else if(value > 1){
                    value = 1;
                }
                return value;
            }
        }
    };
    return Slider;
});
