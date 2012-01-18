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
    var query = req.query,
        pageSize = req.size?parseInt(query.size,10) : 20,
        page : req.page?parseInt(query.page,10) : 20;

    query.deleted = {"$ne":true};
    var sharequery = Share.find(query);
    sharequery
        .sort('_id', -1)
        .limit(pageSize)
        .skip((page-1)*pageSize)

    sharequery.exec(function(err,shares){
        if(err) return next(err);
        res.send(shares);
    });

};

exports.new = function(req,res){

    if(!req.user){
        res.redirect('/login?redirect=' + req.url);
        return;
    }

    var postname = req.query.shareset;

    ShareSet.findOne({
        postname:postname
    }, function(err,shareset){
        var share = new Share();
        share.authors = [''];
        res.render('share/edit', {
            title: '添加到 '+ shareset.subject
           ,share : share
           ,navtab : 'share'
           ,isNew : true
           ,shareset : postname
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
        owner : req.user._id
    });

    share.save(function(error,saved){
        if(error){
            res.send({
                errors : error.errors || error.message,
            });
            return;
        }

        ShareSet.findOne({
            postname : body.shareset
        }, function(err, doc){
            if(err) return next(err);

            if(!doc)
                return res.send({
                    errors : null,
                    action : 'redirect',
                    redirect : '/share/'+ saved._id
                });

            doc.shares.push(saved._id)
            doc.save(function(error, saved){
            res.send({
                errors : null,
                action : 'redirect',
                redirect : '/shareset/'+ body.shareset
            });
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
    res.render('share/edit',{
        title : '编辑 ' + share.title
       ,share : share
       ,navtab : 'share'
       ,isNew : false
       ,shareset : req.query.shareset
    });

};

exports.update = function(req,res,next){
    var share = req.share,
        body = req.body;

    _.extend(share,{
        title : body.title,
        authors : getList(body.authors),
        tags : body.tags,
        desc: body.desc
    });

    share.save(function(err,saved){
        if(err) return next(err);
        res.send({
            errors : null,
            action : 'redirect',
            redirect : body.shareset?'/shareset/' + body.shareset: '/share/'+share._id
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
