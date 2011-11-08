var request = require('request');
var hashlib = require('hashlib');
var apibase = 'http://www.slideshare.net/api/2/get_slideshow';
var api_key = 'dV2nzFR6';
var shared_secret = 'Yh8atgnr';

function getSlide(url){
    if(!url){
        url = 'http://www.slideshare.net/seanhewens/tedx-in-a-box-presentation';
    }

    var ts = Date.now();
    var hash = hashlib.sha1(shared_secret + ts);
    var url = apibase + "?api_key=" + api_key + "&ts="+ts+ "&hash=" + hash + "&slideshow_url=" + encodeURIComponent(url);

    console.log('requesting', url)

    request.get( url, function(err, res, body){
        if(err) throw err;
        if(res.statusCode !== 200){
            console.log('code', res.statusCode)
        }
        console.log(body);

    });
}

exports.getSlide = getSlide;
