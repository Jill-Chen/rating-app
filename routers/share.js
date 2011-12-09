var ShareSet = require('../modules/').ShareSet;
var _ = require('underscore');
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
            shares : shares
           ,query  : query
           ,navtab : 'share'
           ,type   : req.params.listtype
           ,title  : '所有分享'
        });
    });

};
exports.new = function(req,res){
    if(!req.user){
        res.redirect('/login?redirect=' + req.url);
        return;
    }
    var sharesetId = req.query.shareset;
    ShareSet.findOne({postname:sharesetId}, function(err,shareset){
        var share = new Share({
            shareset :shareset._id
        });
        res.render('share/new', {
            title: '添加分享到分享会'
           ,share : share
           ,navtab : 'share'
           ,shareset : shareset
        });
    })
};
exports.create = function(req,res,next){

    var body = req.body;
    var share = new Share({
        title : body.title,
        authors : body.authors,
        tags : body.tags,
        desc: body.desc,
        shareset : body.shareset,
        owner : req.user._id
    });

    share.save(function(error,saved){
        if(error){
            res.send({
                errors : error.errors || error.message,
            });
            return;
            //return next(error);
        }
        ShareSet.findById(body.shareset, function(err, docs){
            if(err) return next(err);
            if(!docs)
                return res.send({
                    errors : [{type:"分享会不存在"}]
                });

            res.send({
                errors : null,
                action : 'redirect',
                redirect : '/shareset/'+ docs.postname
            });
        });
    });

};
exports.show = function(req,res){
    var share = req.share;
    if(!share.shareset){
        res.render('share/show', {
            title : share.authors.join(',') + ':' + share.title
           ,share : share
           ,navtab : 'share'
           ,shareset : null
        });
        return;
    }
    ShareSet.findById(share.shareset, function(err, doc){
        if(err) return next(err);
        res.render('share/show', {
            title : share.authors.join(',') + ':' + share.title
           ,share : share
           ,navtab : 'share'
           ,shareset : doc
        });

    });

};
exports.edit = function(req,res){
    var share= req.share;
    if(!req.user){
        res.redirect('/login?redirect=' + req.url);
        return;
    }
    ShareSet.findById(share.shareset,function(err,doc){
        if(err) return next(err);
        res.render('share/edit',{
            title : '编辑 ' + share.title
           ,share : share
           ,navtab : 'share'
           ,shareset : doc
        });
    });

}
exports.update = function(req,res){
    var share = req.share;
    _(req.body).each(function(v,k){
        share[k] = v;
    });
    ShareSet.findById(share.shareset,function(err,ssdoc){
        share.save(function(err,saved){
            if(err){
                res.send({
                    errors : err.errors || err.message,
                });
                return;
            }
            res.send({
                errors : null,
                action : 'redirect',
                redirect : '/shareset/' + ssdoc.postname
            });
        });
    });
};

exports.destroy = function(req,res, next){
    req.share.deleted = true;
    req.share.save(function(err, doc){
        if(err) {
            res.send({
                errors : err.errors || [{error : err, type : '出错了'}]
            });
            return;
        }
        res.send({
            errors : null,
            action : 'redirect',
            // 刷新本页面
            redirect : ''
        });
    });
};
