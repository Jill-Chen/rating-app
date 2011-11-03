var ShareSet = require('../modules/').ShareSet;
var Share = require('../modules/').Share;

//auto load
exports.load = function(id,next){
    Share.findById(id,function(err,doc){
        next(err,doc)
    });
};

exports.index = function(req,res){
    var query = req.query;
    query.deleted = {"$ne":true};
    var sharequery = Share.find(query);
    sharequery.sort('_id',-1);

    sharequery.exec(function(err,shares){
        if(err) return next(err);
        res.render('share/index', {
            shares : shares,
            query : shares,
            type : req.params.listtype,
            title : '所有分享'
        });
    });

};
exports.new = function(req,res){
    var share = new Share();
    var sharesetId = req.query.shareset;
    ShareSet.findById(sharesetId, function(err,shareset){
        res.render('share/new', {
            title: '添加分享到分享会',
            share : share,
            shareset : shareset
        });
    })
};
exports.create = function(req,res){

};
exports.show = function(req,res){
    var share = req.share;
    if(!share.shareset){
        res.render('share/show', {
            title : share.authors.join(',') + ':' + share.title,
            share : share,
            shareset : null
        });
        return;
    }
    ShareSet.findById(share.shareset,function(err, doc){
        if(err) return next(err);

        res.render('share/show', {
            title : share.authors.join(',') + ':' + share.title,
            share : share,
            shareset : doc
        });

    });

};
exports.edit = function(req,res){

}
exports.update = function(req,res){

}
exports.delete = function(req,res){

}
