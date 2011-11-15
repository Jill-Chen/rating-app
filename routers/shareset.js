var ShareSet = require('../modules/').ShareSet;
var Share = require('../modules/').Share;

exports.load = function(id,next){
    ShareSet.findOne({
        postname : id
    },function(err,doc){
        next(err,doc)
    });
};

exports.index = function(req,res){
    var q= req.query,
        queryobj = {};
    queryobj.deleted = { "$ne" : true };

    if(!q.tab){
        queryobj.startTime = {
            $gt : new Date()
        }
    }

    if(req.loggedIn && q.tab === 'my'){
        queryobj.owner = req.user._id;
    }

    var query = ShareSet.find(queryobj);
    query.sort('_id',-1);
    query.limit(20);

    query.exec(function(err,shares){
        if(err) return next(err);
        req.results = shares;
        res.render('shareset/index', {
            results : req.results,
            query : req.query,
            type : req.params.listtype,
            title : '所有分享'
        });
    });
};

exports.new = function(req,res){
    if(!req.user){
        res.redirect('/login');
    }
    var shareset = new ShareSet();
    res.render('shareset/new', {
        title: '组织一次分享',
        error : [],
        shareset : shareset
    });
};

exports.create = function(req,res){
    var shareset = new ShareSet(),
        reqbody = req.body;
    shareset.subject = reqbody.subject;
    shareset.endTime = reqbody.endTime;
    shareset.startTime = reqbody.startTime;
    shareset.position = reqbody.position;
    shareset.desc = reqbody.desc;
    shareset.postname = reqbody.postname;
    shareset.category = reqbody.category;

    shareset.owner = req.user._id;

    shareset.save(function(error,saved){
        if(error){
            console.log(error);
            res.send({
                errors : error.errors || error.message
            });
            return;
        };
        res.send({
            errors : null,
            action : 'redirect',
            redirect : '/shareset/' + saved.postname
        });
    });

};

exports.show = function(req,res, next){
    var ss = req.shareset;
    Share.find({shareset : ss._id, deleted : {$ne : true}}, function(err, docs){
        var isOwner = req.loggedIn && req.user._id.toString() == ss.owner.toString();
        if(err) return next(err);
        res.render('shareset/show',{
            title : ss.subject
           ,shareset : ss
           ,isOwner : isOwner
           ,shares : docs
        });
    });
};

exports.edit = function(req,res){
    var shareset = req.shareset;

    res.render('shareset/edit',{
        title : '编辑 ' + shareset.subject
       ,shareset : shareset
    });
}

exports.update = function(req,res){
    var shareset = req.shareset;
    shareset.subject = req.body.subject;
    shareset.endTime = req.body.endTime;
    shareset.startTime = req.body.startTime;
    shareset.position = req.body.position;
    shareset.desc = req.body.desc;

    shareset.save(function(error,saved){
        if(error && error.errors){
            res.send({
               errors : error.errors
            });
            return;
        }
        res.send({
            errors : null,
            action : 'redirect',
            redirect : '/shareset/' + saved.postname
        });
    });

};

exports.destroy = function(req,res, next){
    req.shareset.deleted = true;
    req.shareset.save(function(err, doc){
        console.log('destroy', err, doc)
        if(err) {
            res.send({
                errors : [{error : err, type : '出错了'}]
            });
            return;
        }
        res.send({
            errors : null,
            action : 'redirect',
            redirect : '/shareset'
        });
    });
};

