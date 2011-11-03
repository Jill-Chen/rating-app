var ShareSet = require('../modules/').ShareSet;

var shareset = new ShareSet({
    subject : ''
});

shareset.save(function(err, saved){
    console.log(err);
    console.log(saved);
    shareset = ShareSet.findById( saved._id, function(err,doc){
        console.log('find', err);
        console.log(doc);
        doc.save(function(err,doc){
            console.log('save back ', err)
            console.log(doc);
        })
    })
});
exports = {
    'Module test:Shareset' : function(beforeExit, assert){
        var shareset = new ShareSet({
            subject : ''
        });

        shareset.save(function(err, saved){
            assert.eql(true, !!err);
            assert.eql('请填写主题', err.errors[0].type);
        });
        console.log('xxx')
    }
};
