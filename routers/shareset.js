var ShareSet = require('../modules/').ShareSet;
var Share = require('../modules/').Share;
var moment = require('moment');
var _ = require('underscore');
var Errors = require('../mods/errors');

exports.load = function(id, next){
    ShareSet
    .findOne({
        postname : id
    })
    .populate('owner')
    .run(function(err,doc){
        next(err,doc)
    });
};

exports.index = {
    'default' : function(req,res){
        var queryObj = {
                deleted : {"$ne" : true}
            }
           ,month = req.param('month')//YYYY-MM
           ,start
           ,end;

        //日期限定
        if(month){
            start = !month ? moment(moment().format('YYYY-MM')): moment(month, 'YYYY-MM')
            end = moment(start.valueOf()).add('M',1)
            queryObj.date = {
                $gte : start.native()
               ,$lte : end.native()
            }

        }

        var find = ShareSet.find(queryObj)
            .sort('_id',-1)
            .limit(20);

        find.exec(function(err,sharesets){
            if(err) return next(err);
            res.send( sharesets );
        });

    },
    'html' : function(req,res){
        res.render('shareset/index', {
            navtab : 'shareset'
           ,title : '分享会'
        });
        return;
        var start = !month ? moment(moment().format('YYYY-MM')): moment(month, 'YYYY-MM');
        var end = moment(start.valueOf()).add('M',1);
        var today = moment();
        var firstMonday = moment(start.valueOf()).add('days', - start.day());
        var lastSunday = moment(end.valueOf()).add('days', 6 - end.add('days', -1).day());

        var days = [];

        var d = firstMonday;

        _(lastSunday.diff(firstMonday,'days')).times(function(){
            days.push({
                moment : d
               ,sharesets : []
               ,current : d.diff(start,'months') === 0
               ,today : today.format('YYYYMMDD') == d.format('YYYYMMDD')
            });
            d = moment(d.valueOf()).add('days',1);
        });


        var query = ShareSet.find(queryobj);
        query.sort('_id',-1);
        query.limit(20);

        query.exec(function(err,sharesets){
            if(err) return next(err);
            _(sharesets).each(function(shareset){
                var diffd = moment(shareset.date).diff(firstMonday,'days');
                days[diffd].sharesets.push(shareset);
            });
            res.render('shareset/index', {
                navtab : 'shareset'
               ,query : req.query
               ,type : req.params.listtype
               ,days : days
               ,current : start
               ,title : '分享会'
            });
        });
    }
};

exports.new = function(req,res){
    if(!req.user){
        res.redirect('/login?redirect=' + req.url);
        return;
    }
    var shareset = new ShareSet();

    res.render('shareset/edit', {
        title: '组织一次分享'
       ,isNew : true
       ,navtab : 'create'
       ,shareset : shareset
    });
};

exports.create = function(req,res){
    var shareset = new ShareSet(),
        reqbody = req.body;
    shareset.subject = reqbody.subject;
    shareset.date = reqbody.date;
    shareset.startTime = (reqbody.startTimeH)+":"+(reqbody.startTimeM);
    shareset.endTime  = (reqbody.endTimeH)+":"+(reqbody.endTimeM);
    shareset.position = reqbody.position;
    shareset.desc = reqbody.desc;
    shareset.postname = reqbody.postname;
    shareset.category = reqbody.category;

    shareset.owner = req.user._id;

    shareset.save(function(error,saved){
        if(error){
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
        //var isOwner = req.loggedIn && req.user._id.toString() == ss.owner.toString();
        if(err) return next(err);
        res.render('shareset/show',{
            title : ss.subject
           ,shareset : ss
           ,navtab : 'shareset'
           //,isOwner : isOwner
           ,shares : docs
        });
    });
};

exports.edit = function(req,res){
    var shareset = req.shareset;

    res.render('shareset/edit',{
        title : '编辑 ' + shareset.subject
       ,isNew : false
       ,navtab : 'shareset'
       ,shareset : shareset
    });
}

exports.update = function(req,res){
    var shareset = req.shareset,
        reqbody = req.body;
    shareset.subject = reqbody.subject;
    shareset.date = reqbody.date;
    shareset.startTime = (reqbody.startTimeH||'00')+":"+(reqbody.startTimeM||'00');
    shareset.endTime  = (reqbody.endTimeH||'00')+":"+(reqbody.endTimeM||'00');
    shareset.position = reqbody.position;
    shareset.desc = reqbody.desc;

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
        if(err) {
            res.send({
                errors : [{error : err, type : '出错了'}]
            });
            next(err)
            return;
        }
        res.send({
            errors : null,
            action : 'redirect',
            redirect : '/shareset'
        });
    });
};

