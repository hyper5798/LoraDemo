var moment = require('moment');
var JsonFileTools =  require('./jsonFileTools.js');
//var ParseDefine =  require('./parseDefine.js');
var mData,mMac,mRecv,mDate,mTimestamp,mType,mExtra ;
var obj;
var path = './public/data/finalList.json';
var path2 = './public/data/setting.json';
var userPath = './public/data/user.json';
var finalList = {};
var linebot = require('linebot');
var settings = require('../settings');

init();

module.exports = {
    parseMsg,
    setFinalList,
    saveFinalListToFile,
    getFinalList,
	saveSetting,
    getTabledata,
    getSetting,
    sendLineMessage
}

function init(){
    try{
        finalList = JsonFileTools.getJsonFromFile(path);
    } catch(e) {
        console.log('Get finalList error : ' + e);
        finalList = {};
        JsonFileTools.saveJsonToFile(path, finalList);
    }
    if (finalList === null) {
        finalList = {};
    }
}

function parseMsg (obj) {
    //Get data attributes
    mData = obj.data;
    mMac  = obj.macAddr;
    mRecv = obj.recv;
    mDate = moment(mRecv).format('YYYY/MM/DD HH:mm:ss');
    mTimestamp = new Date(mRecv).getTime();
    mInfo = parseData(obj.data);
    var msg = {macAddr: mMac, data: mData, recv: mRecv, date: mDate,
                information: mInfo, timestamp: mTimestamp};
    finalList[mMac]=msg;
    saveFinalListToFile ();
    return msg;
    
}

function setFinalList (list) {
    finalList = list;
}

function getFinalList () {
    return finalList;
}

function setFinalList (list) {
    finalList = list;
}

function getSetting () {
    try {
        var setting = JsonFileTools.getJsonFromFile(path2);
    }
    catch (e) {
        var setting = {};
    }
    return setting;
}

function saveFinalListToFile () {
    JsonFileTools.saveJsonToFile(path,finalList);
}

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function parseData(data) {
    var info = {};
    var obj = { 'temperature':[0,4,100], 'humidity':[4,8,100]};
    var keys = Object.keys(obj);
    var count = keys.length;

    for(var i =0;i<count;i++){
        console.log( keys[i]+' : '+ obj[keys[i]]);
        info[ keys[i] ] = getIntData(obj[keys[i]],data);
    }
    return info;
}

function getIntData (arrRange,data){
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

function getTabledata (lists) {
    var rows = 0;
    var mItem = 1;
    var array = [];
    console.log( 'Last Device Information \n '+JSON.stringify( lists[lists.length-1]));

    for (var i=0;i<lists.length;i++)
    {
        array.push(getArray(lists[i],mItem));
        
        mItem++;
    }
    return array;
}

function getArray (obj,item){
    var arr = [];
    if(item<10){
        arr.push('0'+item);
    }else{
        arr.push(item.toString());
    }
    
    arr.push(obj.date);
    arr.push(obj.data);
    var keys = Object.keys(obj.information);
    for (var i = 0;i < keys.length; i++) {
        arr.push(obj.information[keys[i]]);
    }
    return arr ;
}

function saveSetting (max, callback) {
    var json = {tempMax : Number(max)};
    try {
        JsonFileTools.saveJsonToFile(path2, json);
    }
    catch (e) {
        return callback(e.message);

    }
    return callback(null,'ok');
}

function sendLineMessage (msg) {
    var bot = linebot({
        channelId: settings.channelId,
        channelSecret: settings.channelSecret,
        channelAccessToken: settings.channelAccessToken
    });
    var user = JsonFileTools.getJsonFromFile(userPath);
    if (user.friend.length > 0) {
        bot.multicast(user.friend, msg).then(function (data) {
            // success 
            console.log('push line :' + JSON.stringify(data));
        }).catch(function (error) {
            // error 
            console.log('push line error :' + error);
        });
    }
}


