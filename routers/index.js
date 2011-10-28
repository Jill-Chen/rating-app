var _ = require('underscore');

_(['manage']).each(function(name){
    exports[name] = require('./' + name);
});
