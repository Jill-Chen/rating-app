var modules = require('../modules/')
var Share = modules.Share;
var ShareSet = modules.ShareSet;


//exports['/shareset/show'] = {
    //get : function(req, res){
        //var ss = req.shareset;

        //res.render('shareset',{
            //title : ss.subject
           //,shareset : ss
           //,shares : req.shares
        //});
    //}
//}

exports['/shareset/add']= {
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

exports['/shareset/edit/:setId'] = {
    get : function(req, res){
        var shareset = req.shareset;

        res.render('create',{
            title : '编辑 ' + shareset.subject
           ,shareset : shareset
           ,shares : req.shares
        });

    },
    post : function(req,res){

        console.log('post');
        var shareset = req.shareset;

        shareset.subject = req.body.subject;
        shareset.endTime = req.body.endTime;
        shareset.startTime = req.body.startTime;
        shareset.position = req.body.position;
        shareset.desc = req.body.desc;

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

exports['/shareset/delete/$setId'] = {
   get : function(req,res,next){
       req.shareset.deleted = true;

       req.save(function(err, doc){
           if(err) return next(err);
           res.redirect('/shareset/list');
       });
    }
};

exports['/share/add/:setId']= {
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

    post : function(req,res,next){
        console.log(req.form);
        console.log(req.body);
        req.form.complete(function(err, fields, files){
            console.log('complete');
            if(err){
                next(err);
            }else{
                console.dir('fields', fields);
                console.log('upload s% to s%', files.cover.filename, files.cover.path);
                //var share = new Share({
                    //title : req.body['title']
                   //,authors : req.body['authors']
                   //,tags : req.body['tags']
                   //,desc : req.body['desc']
                   //,owner : req.user._id
                   //,shareset : req.params.setId
                //});
            }
        });
        req.form.on('progress', function(bytesReceived, bytesExpected){
            var percent = (bytesReceived / bytesExpected * 100) | 0;
            process.stdout.write('Uploading: %' + percent + '\r');
        });

        //share.save(function(error,saved){
            //console.log('save', error);
            //if(error && error.errors){
                //res.render('create', {
                    //title: 'Create a Cate',
                    //errors : error.errors,
                    //share : share
                //});
                //return;
            //}
            //res.redirect('/create-ok/' + saved._id);
        //});
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

