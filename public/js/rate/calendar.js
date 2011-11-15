KISSY.add('rate/calendar',function(S, Calendar){
      var calendars = [];
      var $ = S.all;
      $('.ctl-date').each(function(el){
        $el = $(el);
        var date = S.Date.parse(el.val()) || new Date();
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        var c =  new Calendar(el, {
          popup : true,
          selected : date,
          triggerType : ['click']
        }).on('select',function(ev){
          this.hide();
          el.val(S.Date.format(ev.date,"yyyy-mm-dd"));
        });
        calendars.push(c);
      });
},{
    requires : ['calendar','calendar/assets/base.css']
})
