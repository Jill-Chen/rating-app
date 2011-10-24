var _ = require('underscore');

_(['account', 'manage']).each(function(name){
    exports[name] = require('./' + name);
});
