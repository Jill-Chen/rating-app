KISSY.add('rate/form-error', function(S){
    var $ = S.all;
    var FormError = function(cfg){
        this.template = S.Template(cfg.template);
        this.container = $(cfg.container);
    }
    S.augment(FormError,{
        render : function(msg){
            var errors;
            if(S.isString(msg.errors)){
                errors = [{type : msg.errors}];
            }else{
                errors = msg.errors
            }

            console.log(errors);
            this.container
                .html(this.template.render({errors : errors}))
                .show();;
        },
        clear : function(){
            this.container.hide()
                .html('')
        }
    });
    return FormError;
});
