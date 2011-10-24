var _ = require("underscore");

exports.login = function(req,res){
    res.send('login');
};

exports.logout = function(req,res){
    res.send('logout');
};

exports.create = function(req,res){
    res.send('create');
};
