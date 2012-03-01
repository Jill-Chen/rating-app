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
    .populate('shares',null,{deleted: {$ne : true}})
    .populate('owner')
    .run(function(err,doc){
        next(err,doc)
    });
};

exports.index = function(req,res,next){
    var q = req.query
       ,queryObj = {
            deleted : {"$ne" : true}
        }
       ,sortField = '_id'
       ,sortDirect = -1
       ,pageSize = q.size? parseInt(q.size,10) : 20
       ,page = q.page? parseInt(q.page,10) : 1
       ,month = q.month //YYYY-MM
       ,start
       ,end;

    //日期限定
    if(month){
        //选取一个指定月份的分享
        start = !month ? moment(moment().format('YYYY-MM')): moment(month, 'YYYY-MM')
        end = moment(start.valueOf()).add('M',1)
        queryObj.date = {
            $gte : start.native()
           ,$lte : end.native()
        }
    }

    if(q.name){
        queryObj.name = q.name;
    }

    if(q.type){
        if(q.type === 'recent'){
            start = moment().add('w',-1);
        }
        queryObj.date = {
            $gte : start.native()
        }
        sortDirect = 1;
    }

    ShareSet.find(queryObj)
        //.populate('share', ['title','authors'], {deleted : {$ne : true}})
        .populate('shares')
        .sort(sortField, sortDirect)
        .limit(pageSize)
        .skip((page-1)*pageSize)
        .run(function(err, sharesets){
            if(err) return next(err);
            res.send( _(sharesets).map(function(ss){
                return {
                    _id : ss._id,
                    subject : ss.subject,
                    owner : ss.owner,
                    name : ss.name,
                    date : ss.date.getTime(),
                    startTime : ss.startTime,
                    endTime : ss.endTime,
                    postname : ss.postname,
                    position: ss.position,
                    desc : ss.desc

                }
            }));
        });
};

exports.new = function(req,res){
    if(!req.user){
        res.redirect('/login?redirect=' + req.url);
        return;
    }
    var user = req.user;

    var defaultName = user.setting && user.setting.defaultSharesetName?
        user.setting.defaultSharesetName : '';

    var shareset = new ShareSet({
        name : defaultName
    });

    if(req.query.date){
        shareset.date = req.query.date;
    }

    res.render('shareset/edit', {
        title: '组织一次分享'
       ,isNew : true
       ,navtab : 'create'
       ,shareset : shareset
    });
};

exports.create = function(req,res){
    var shareset = new ShareSet(),
        reqbody = req.body,
        error = {},
        user = req.user;

    shareset.subject = reqbody.subject;
    shareset.name = reqbody.name;
    shareset.date = reqbody.date;
    shareset.startTime = (reqbody.startTimeH)+":"+(reqbody.startTimeM);
    shareset.endTime  = (reqbody.endTimeH)+":"+(reqbody.endTimeM);
    shareset.position = reqbody.position;
    shareset.desc = reqbody.desc;
    shareset.postname = reqbody.postname;
    shareset.category = reqbody.category;
    shareset.owner = req.user._id;

    //检查URL是否已被使用
    checkPostname(save, shareset);

    function checkPostname(fn, shareset){

        if(!shareset.postname){
            fn({
                postname : {
                    type : '请输入个性URL'
                }
            });
        }

        ShareSet.findOne({
            postname : shareset.postname
        }, function(err,doc){
            var error = null;
            if(err) return next(err);
            if(doc){
                error = {
                    postname : {
                        type : '这个url已经被人用过了'
                    }
                };
            }
            fn(error, shareset);
        });
    }


    function save(err,shareset){

        if(err){
            res.send({
                errors : err
            });
            return ;
        }

        shareset.save(function(err,saved){
            if(_(error).keys() > 0){
                err = err || {};
                err.errors = err.errors || {};
                _.extend(err.errors, errors);
            }
            if(err){
                res.send({
                    errors : err.errors || err.message
                });
                return;
            };
            res.send({
                errors : null,
                action : 'redirect',
                redirect : '/shareset/' + saved.postname
            });

            //保存默认分享会名称
            user.setting.defaultSharesetName = shareset.name;
            user.save();
        });
    }
};

exports.show = function(req,res, next){
    var ss = req.shareset;
    res.render('shareset/show',{
        title : ss.subject
       ,shareset : ss
       ,navtab : 'shareset'
       ,shares : ss.shares
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
        body = req.body;


    _.extend(shareset, {
        subject : body.subject
       ,date : body.date
       ,name : body.name
       ,position : body.position
       ,startTime : (body.startTimeH)+":"+(body.startTimeM)
       ,endTime  : (body.endTimeH)+":"+(body.endTimeM)
       ,desc : body.desc
       ,owner : req.user._id
    });

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

    _.extend(req.shareset, {
        deleted : true
       ,owner : req.user._id
    });

    req.shareset.save(function(err, doc){
        if(err) {
            res.send({
                errors : [{error : err, type : '出错了'}]
            });
            return;
        }

        res.send({
            errors : null,
            action : 'redirect',
            redirect : '/calendar'
        });
    });
};

