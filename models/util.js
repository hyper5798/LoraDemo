var moment = require('moment-timezone');
var config = require('../settings');
var debug = config.debug;
var axios = require('axios');
var JsonFileTools =  require('./jsonFileTools.js');
//Jason modify on 2018.05.06 for switch local and cloud db -- start
var dbMap = require('./mongoMap.js');
var JsonFileTools =  require('./jsonFileTools.js');
var path = './public/data/finalList.json';
var path2 = './public/data/checkMap.json';

//Jason modify on 2018.05.06 for switch local and cloud db -- end
var finalList = {};
var checkEvent = {};
var checkMap= {};
init()

module.exports = {
    init,
    checkDevice,
    parseMsgd,
    createMap,
    checkFormData,
    isDebug,
    addJSON,
    getCurrentTime,
    httpGet,
    encodeBase64,
    decodeBase64,
    DateTimezone,
    getISODate,
    getMacString,
    getType,
    getCurrentUTCDate
}

function init() {
    dbMap.find({}).then(function(docs) {
        if(docs) {
            for(let i=0; i<docs.length;++i){
                let map = docs[i];
                checkMap[map.deviceType] = map;
            }
            JsonFileTools.saveJsonToFile(path2, checkMap);
        }
        
    }, function(reason) {
        console.log(getCurrentTime() + ' init err : ' + reason);
    });
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

function httpGet(url, username, password) {
    const tok = username + ':' + password;
    const hash = encodeBase64(tok);
    const Basic = 'Basic ' + hash;
    axios.get(url, {headers : { 'Authorization' : Basic }})
    .then(response => {
        console.log(response.data.url);
        console.log(response.data.explanation);
        return response.data;
    })
    .catch(error => {
        console.log(error);
        return error;
    });
}

function isDebug () {
    return config.debug;
}

function encodeBase64 (codeStr) {
    return Buffer.from(codeStr).toString('base64');
}

function decodeBase64 (encodeStr) {
    return Buffer.from(encodeStr, 'base64').toString('ascii');
}
  
function checkDevice(mac, callback) {
    var datas = db.getDevices(mac, function(err, devices){
        if (err) {
          // console.log('getDevices fail : ' + err);
          return callback(err);
        }
        // console.log('getDevices success : \n' + JSON.stringify(devices));
        return (null,devices);
    })
}

function parseMsgd(message) {
    var obj = null;
    try {
        if (getType(message) === 'string') {
            var mesObj = JSON.parse(message);
            if (getType(mesObj) === 'array') {
                obj = mesObj[0];
            } else if (getType(mesObj) === 'object') {
                obj = mesObj;
            }
        } else if (getType(message) === 'array'){
            obj = message[0];
        } else if (getType(mesObj) === 'object') {
            obj = message;
        }
        var fport = obj.fport.toString();
        //Get data attributes
        var mData = obj.data;
        var mMac  = obj.macAddr;
        if(debug != true) {
            if (checkEvent[mMac] === undefined) {
                checkEvent[mMac] = obj;
            } else if (isRepeatEvent(checkEvent[mMac], obj)) {
                // It's repeat event 
                console.log('Repeat event drop!!!');
                return null;
            }
        }
       
        var utcMoment = moment.utc(obj.time);
        var timestamp = utcMoment.valueOf();
        var tMoment = (moment.unix(timestamp/1000)).tz(config.timezone);
        var mDate = tMoment.format('YYYY-MM-DD HH:mm:ss');
        // var mRecv = obj.time;
        // var mRecv = new Date( utcMoment.format("YYYY-MM-DDTHH:mm:ss") );
        var mRecv = obj.time;
    
        console.log('mRecv : '+  mRecv);
        console.log('mDate : '+ mDate);
        var mExtra = {'gwip': obj.gwip,
                  'gwid': obj.gwid,
                  'rssi': obj.rssi,
                  'snr' : obj.snr,
                  'fport': obj.fport+'',
                  'frameCnt': obj.frameCnt,
                  'channel': obj.channel};
    } catch (error) {
        return callback(error.message);
    }

    //Parse data
    if(mExtra.fport){
        var mType = mExtra.fport.toString();
        let map = checkMap[mType];
        if(map) {
            var mInfo = getTypeData(mData, map);
            if (debug) {
                console.log(getCurrentTime() + ' parsers : ' + JSON.stringify(mInfo));
            }
            
            if(mInfo){
                var msg = {macAddr: mMac, data: mData, timestamp: timestamp, recv: mRecv, date: mDate, type: mExtra.fport, typeName: map.typeName};
                console.log('**** '+msg.date +' mac:'+msg.macAddr+' => data:'+msg.data+'\ninfo:'+JSON.stringify(mInfo));
                msg.information=mInfo;
                
                if (debug) {
                    console.log(getCurrentTime() + ' parseMsgd message : ' + JSON.stringify(msg));
                }
                // sendLineMessage(mDate + ' newmessage');
                /*if (doc.profile) {
                    toCheckNotify(mInfo, doc.profile, mMac);
                }*/
                finalList[mMac]=msg;
                saveFinalListToFile ();
                return msg;
            } else {
                if (debug) {
                    console.log(new Date() + 'parseMsgd info is not exist');
                }
                return null;
            }
        } else {
            console.log(new Date() + 'No map for type '+ mType);
            return null;
        }
    } else {
        console.log(new Date() + 'parseMsgd fport is not exist');
        return null;
    }
}

function saveFinalListToFile () {
    JsonFileTools.saveJsonToFile(path,finalList);
}

function createMap (myobj) {
    
    dbMap.create(myobj).then(function(docs) {
        console.log('docs : ' + JSON.stringify(docs));
        console.log('init() ');
        init();
    }, function(reason) {
        console.log('err : ' + reason);
    });
}

function getTypeData(data,mapObj) {
    if (mapObj === undefined|| mapObj === null) {
        return null;
    }
    try {
        var obj = mapObj.map;
        var info = {};
        var keys = Object.keys(obj);
        var count = keys.length;
        for(var i =0;i<count;i++){
            //console.log( keys[i]+' : '+ obj[keys[i]]);
            let parseData =  getIntData(keys[i], obj[keys[i]],data);
            info[keys[i]] = parseData.toFixed(2);

            //info[keys[i]] = getIntData(keys[i], keys[i], obj[keys[i]],data);
            // console.log(keys[i] + ' : ' + info[keys[i]]);
        }
        return info;
    } catch (error) {
        return null;
    }
}

function getIntData(key, arrRange,initData){
    var ret = {};
    var start = arrRange[0];
    var end = arrRange[1];
    var diff = arrRange[2];
    var str = initData.substring(start,end);
    var data = parseInt(str,16);
    
    return eval(diff);
}

function parse(hex) {
    // 0000 03FC –> 1020 
    // FFFF FF68 –> -152 
    hex= parseInt(hex, 16); 
    hex= hex| 0xFFFFFFFF00000000; 
    // node.warn('hex:=' + hex);
    return hex;

}

function convertTime(dateStr){
    //method 1 - use convert function
    //var d = new Date();
    var d = new Date(dateStr);
    var d_ts = d.getTime(); //Date.parse('2017-09-12 00:00:00'); //get time stamp
    // console.log("showSize :"+ d);
    // console.log("showPos d_ts : " + d_ts);
    return d_ts;
}

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function saveMsgToDB (msg) {
    mongoEvent.create(msg).then(function(docs) {
        console.log('saveMsgToDB docs : ' + JSON.stringify(docs));
    }, function(reason) {
        console.log('saveMsgToDB err : ' + reason);
    });
}

function checkFormData (req, checkArr) {
    try {
        var keys = '';
        var values = '';
        var keys = Object.keys(req.body);
        /* if (keys.length < checkArr.length) {
            return null;
        } */
        var count = 0;
        var json = {};
        keys.forEach(function(key,index) {
            // console.log('index : ' + index + ', key : ' + key );
            if(checkArr.indexOf(key) !== -1) {
                json[key] = req.body[key];
                count ++;
            }
        });
        //Not include token key
        if (count !== (checkArr.length)) {
            return null;
        } else {
            delete json.token;
            return json;
        }
    } catch (error) {
        return 'Parameter format error';
    }
}

function addJSON(obj1, obj2) {
    let keys = Object.keys(obj2);
    for (let i=0;i<keys.length; i++) {
        obj1[keys[i]] = obj2[keys[i]];
    }
    return obj1;
}

function getCurrentTime() {
    var utcMoment = moment.utc();
    var timestamp = utcMoment.valueOf();
    var tMoment = (moment.unix(timestamp/1000)).tz(config.timezone);
    var time = tMoment.format('YYYY-MM-DD HH:mm:ss');
    return time;
}

function getCurrentUTCDate() {
    // var utcMoment = moment.utc();
    // return new Date( utcMoment.format("YYYY-MM-DDTHH:mm:ss") );
    var utcMoment = moment.utc();
    return utcMoment.format('YYYY-MM-DDTHH:mm:ss'); 
}

//var utcMoment = moment.utc(obj.time);
//var timestamp = utcMoment.valueOf();
//var tMoment = (moment.unix(timestamp/1000)).tz(config.timezone);
//var mDate = tMoment.format('YYYY-MM-DD HH:mm:ss');

function DateTimezone(offset) {

    // 建立現在時間的物件
    var d = new Date();
    
    // 取得 UTC time
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // 新增不同時區的日期資料
    return new Date(utc + (3600000*offset));

}

function getISODate(dateStr) {
    var utcMoment = moment.utc(dateStr);
    return new Date( utcMoment.format("YYYY-MM-DDTHH:mm:ss") );
}

function getMacString(mac) {
    if(mac.length === 8) {
        mac = '00000000' + mac;
    }
    return mac.toLowerCase();
}

function getUTCDate () {
    var utcMoment = moment.utc();
    return new Date( utcMoment.format("YYYY-MM-DDTHH:mm:ss") );
 }

function getMyDate (dateStr) {
    var myMoment = moment(dateStr, "YYYY-MM-DDTHH:mm:ss");
    var utcMoment = myMoment.utc(dateStr);
    return new Date( utcMoment.format("YYYY-MM-DDTHH:mm:ss") );
 }

 // sendLineMessage(mDate + ' newmessage');
 function  toCheckNotify(info, profile, mac) {
    if (config.channelId ==='' || config.channelSecret ==='' || config.channelAccessToken ==='') {
        return;
    }
    var keys = Object.keys(info);
    var message = '';
    var recv = getCurrentUTCDate();
    var time = getCurrentTime();
    var hStr = '超過';
    var lStr = '低於';
    for (let i = 0; i < keys.length; ++i) {
        let obj = profile[keys[i]];
        let data = info[keys[i]];
        if (obj.high !== '' && data > Number(obj.high) ) {
            message = message + ' ' + obj.title + hStr + obj.high;
        }
        if (obj.low !== '' && data < Number(obj.low) ) {
            message = message + ' ' + obj.title + lStr + obj.low;
        }
    }
    if (message !== '') {
        var sqlStr = 'select * from api_device_info where device_type = "LoRaM"';
        mysqlTool.query(sqlStr, function(err, result){
            if (err) {
                console.log(err);
                return;
            } else if (result === undefined || result === null) {
                console.log('unable get device');
                return;
            }

            var name = '';
            var cpId = '';
            if (err || result.length === 0) {
                name = mac;
            } else {
                for (let i = 0; i < result.length; ++i) {
                    if (result[i].device_mac === mac) {
                        cpId = result[i].device_cp_id;
                        break;
                    }
                }
                if (name === '') {
                    name = mac;
                }
            }
            //Jason fix cpId is null unable conert to string cause crash issue on 2018.04.29
            if (cpId === '') {
                return;
            } 
            var json = {type:'notify', subject:'異常通知', content: message, createUser: name, cpId: cpId.toString()};
            message = time + ' 裝置:' + name + message;
            sendLineMessage(message);
        });
    }
 }

function isRepeatEvent(checkObj, obj) {
    if (checkObj.frameCnt === obj.frameCnt) {
        var timestamp1 = moment.utc(checkObj.time).valueOf();
        var timestamp2 = moment.utc(obj.time).valueOf();
        var time = Math.abs(timestamp1 - timestamp2)/(60*1000);
        var checkTime = 10;
        if (time < checkTime) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
    return false;
}