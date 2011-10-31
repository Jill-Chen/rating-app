var modules = require('../modules/')
var Share = modules.Share;
var ShareSet = modules.ShareSet;

exports.create = {
    get : function(req,res){
        var shareset = new ShareSet();
        res.render('create', {
            title: '组织一次分享',
            error : [],
            shareset : shareset
        });
    },
    post : function(req,res){
        var shareset = new ShareSet({
            subject : req.body.subject,
            endTime : req.body.endTime,
            startTime : req.body.startTime,
            position : req.body.position,
            desc : req.body.desc,
            owner : req.user._id
        });

        shareset.save(function(error,saved){
            if(error && error.errors){
                res.render('create', {
                    title: 'Create a Cate',
                    errors : error.errors,
                    shareset : shareset
                });
                return;
            }
            res.redirect('/shareset/' + saved._id);
        });
    }
};

exports['add-share/:setId']= {
    get : function(req, res){
        var share = new Share();
        res.render('create-share', {
            title: '添加分享',
            setId : req.params.setId,
            shareset : req.shareset,
            error : [],
            share : share
        });
    },

    post : function(req,res){
        var share = new Share({
            title : req.body['title']
           ,authors : req.body['authors']
           ,tags : req.body['tags']
           ,desc : req.body['desc']
           ,owner : req.user._id
           ,shareset : req.params.setId
        });

        share.save(function(error,saved){
            console.log('save', error);
            if(error && error.errors){
                res.render('create', {
                    title: 'Create a Cate',
                    errors : error.errors,
                    share : share
                });
                return;
            }
            res.redirect('/create-ok/' + saved._id);
        });
    }
};

exports.edit = {
    get : function(req,res){
        res.send('edit get');
        res.end();
    }
   ,post : function(req,res){
        res.send('edit get');
        res.end();
    }
};

exports.delete = {
   post : function(req,res){
        res.send('delete get');
        res.end();
    }
};
