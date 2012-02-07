KISSY.add('rate/form-error', function(S){
    var $ = S.all;
    var FormError = function(form){
        this.form = S.one(form);
    }

    /**
     * the Unit of form elements
     * @param {String} field this name of input
     * @param {HTMLElement} form the form of input
     */
    S.augment(FormError,{
        /**
         * 显示错误信息
         * @param {String} msg 错误信息
         * @param {String} field this name of input
         * @param {HTMLElement} form the form of input
         */
        showError : function(field, oError){
            var self = this,
                input = self.form.all('[name='+field+']'),
                formitem = input?input.parent('.control-group'):null,
                elMsg;

            if(!formitem ){
                return;
            }

            formitem.addClass('error');

            elMsg = formitem.one('.help-inline');

            elMsg.html(oError.type);
        },

        hide : function(field){
            var self = this,
                input = self.form.all('[name='+field+']');

            if(!formitem ){
                return;
            }

            elMsg = input.siblings('span.help-inline');

            if(!elMsg){
                return;
            }
            elMsg.html('');
        },

        removeAll : function(form){
            this.form.all('.error span.help-inline').html('');
        },

        render : function(errors){
            var self = this;
            if(!errors) return;
            S.each(errors, function(error, field){
                if(!error) return;
                self.showError(field, error);
            });

            var elErrors = self.form.all('span.help-inline-error');
            if(elErrors.length){
                S.DOM.scrollTop(elErrors.offset().top - 80);
            }
        }
    });
    return FormError;
},{
    requires : ['sizzle']
});
