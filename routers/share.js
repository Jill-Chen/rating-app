var ShareSet = require('../modules/').ShareSet;
var _ = require('underscore');
var Share = require('../modules/').Share;
var Errors = require('../mods/errors');

/**
 * ['','abc', 'abc'] = > ['abc']
 * '' = > null
 * [] => null
 * 'abc' => ['abc']
 */
var getList = function(source){
    var aRet = _.isArray(source) ?
        _(source).chain().uniq().compact().value() :
            source.trim() === '' ? null : [source];

    if(_.isArray(aRet) && aRet.length > 0 ) return aRet;
    return null;
}

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

    ShareSet.findOne({
        postname:sharesetId
    }, function(err,shareset){

        var share = new Share({
            shareset :shareset._id
        });
        share.authors = [''];

        res.render('share/edit', {
            title: '添加到 '+ shareset.subject
           ,share : share
           ,navtab : 'share'
           ,isNew : true
           ,shareset : shareset
        });
    })
};

exports.create = function(req,res,next){

    var body = req.body;

    var share = new Share({
        title : body.title,
        authors : getList(body.authors),
        tags : body.tags,
        desc: body.desc,
        shareset : body.shareset,
        owner : req.user._id
    });
    console.log(body.authors);

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

    share.viewCount += 1;

    ShareSet.findById(share.shareset, function(err, doc){
        if(err) return next(err);
        res.render('share/show', {
            title : share.authors.join(',') + ':' + share.title
           ,share : share
           ,navtab : 'share'
           ,shareset : doc
        });
        share.save();
    });

};
exports.edit = function(req,res){
    var share= req.share;
    ShareSet.findById(share.shareset,function(err,doc){
        if(err) return next(err);
        res.render('share/edit',{
            title : '编辑 ' + share.title
           ,share : share
           ,navtab : 'share'
           ,isNew : false
           ,shareset : doc
        });
    });

}
exports.update = function(req,res){
    var share = req.share,
        body = req.body;

    _.extend(share,{
        title : body.title,
        authors : getList(body.authors),
        tags : body.tags,
        desc: body.desc
    });

    ShareSet.findById(share.shareset, function(err,ssdoc){
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
    if(!req.user ||
        req.user._id !== req.share.owner._id){
        throw new Errors.NoPermission
    }
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
            redirect : ''
        });
    });
};
