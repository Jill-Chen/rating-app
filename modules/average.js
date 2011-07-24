/**
 * get the average of rates
 */
exports.average = function (arr){
    var sum1 = 0,sum2=0,sum3=0,sum4=0,sum=[];
    var len = arr.length;
    arr.forEach(function(v){
        if(v['rate1'] && v['rate2'] && v['rate3'] && v['rate4']){
            sum1 += v['rate1'];
            sum2 += v['rate2'];
            sum3 += v['rate3'];
            sum4 += v['rate4'];
        }else{
            len --;
        }
    });
    if(len === 0 ) return 0;
    sum.push(Math.round(sum1 / len * 100)/100);
    sum.push(Math.round(sum2 / len * 100)/100);
    sum.push(Math.round(sum3 / len * 100)/100);
    sum.push(Math.round(sum4 / len * 100)/100);
    return sum;
}
