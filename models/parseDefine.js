var aa00Data = { 'temperature':[6,10,100], 'humidity':[10,14,100], 'voltage':[14,18,1] };
var aa01Data = { 'pressure':[6,10,1],'hight':[10,14,1],'temperature':[14,16,1], 'humidity':[16,18,1], 'light':[18,22,1] };
var aa02Data = {'uv':[6,10,1],'rain':[10,14,1]};

exports.getInformation = function (data) { 
    
    var type = data.substring(0,4);
    
    return getTypeData(data,type);

};

function getTypeData(data,type){
    var info = {};
    
    if(type==='aa00'){
        var obj = aa00Data;
    }else if(type==='aa01'){
        var obj = aa01Data;
    }else if(type==='aa02'){
        var obj = aa02Data;
    }
    var keys = Object.keys(obj);
    var count = keys.length;

    for(var i =0;i<count;i++){
        info[ keys[i] ] = getIntData(obj[keys[i]],data);
    }
    return info;
}

function getIntData(arrRange,data){
    var ret = {};
    var start = arrRange[0];
    var end = arrRange[1];
    var diff = arrRange[2];
    var intData = parseInt(data.substring(start,end),16);
    if(diff === 1)
        return intData;
    else
        return intData/diff;
}