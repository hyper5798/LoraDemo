var express = require('express');
var router = express.Router();
var Device = require('../models/device.js');
var settings = require('../settings');
var JsonFileTools =  require('../models/jsonFileTools.js');
var path = './public/data/finalList.json';
var path2 = './public/data/checkMap.json';
var hour = 60*60*1000;
var test = true;


module.exports = function(app) {
  app.get('/', function (req, res) {
		var now = new Date().getTime();
		var device = null,
			finalList = null;
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

		var keys = Object.keys(finalList);
		if (keys.length > 0) {
			device = finalList[keys[0]];
		}
		res.render('index', {
			title: '首頁',
			device: device,
			finalList: finalList
		});
  });

  app.get('/update', function (req, res) {
		var finalList = JsonFileTools.getJsonFromFile(path);
		var keys = Object.keys(finalList);
		var device = null;
		if( keys.length > 0) {
			console.log(keys[0]);
		  console.log(finalList[keys[0]]);
			device = finalList[keys[0]];
		}

		res.render('update', {
			title: '更新',
			device: device
		});
  });

  app.get('/find', function (req, res) {
	console.log('render to post.ejs');
	var find_mac = req.flash('mac').toString();
	var successMessae,errorMessae;
	var count = 0;
	console.log('mac:'+find_mac);

	if(find_mac.length>0){
		console.log('find_mac.length>0');
		Device.findByMac(find_mac , function(err,devices){
			if(err){
				console.log('find name:'+find_mac);
				req.flash('error', err);
				return res.redirect('/find');
			}
			console.log("find all of mac "+find_mac+" : "+devices);
			devices.forEach(function(device) {

				console.log('mac:'+device.macAddr + ', information :' + JSON.stringify(device.information));
				count = count +1;
			});

			if (devices.length>0) {
				console.log('find '+devices.length+' records');
				successMessae = '找到'+devices.length+'筆資料';
				res.render('find', {
					title: '查詢',
					devices: devices
				});
			}else{
				console.log('找不到資料!');
				errorMessae = '找不到資料!';
				req.flash('error', err);
      			return res.redirect('/find');
	  		}

    	});
	}else{
		console.log('find_name.length=0');
		res.render('find', {
			title: '查詢',
			devices: null
	  });
	}

  });
  app.post('/find', function (req, res) {
		var	 post_mac = req.body.mac;
		console.log('find mac:'+post_mac);
		req.flash('mac', post_mac);
		return res.redirect('/find');
  });

  app.get('/setting', function (req, res) {
		res.render('setting', {
			title: '設定'
		});
  });

  app.get('/test', function (req, res) {
	res.render('test', {
		title: '設定'
	});
});

  // Jason add on 2017.11.16
  app.get('/finalList', function (req, res) {
		var now = new Date().getTime();
		var device = null,
			finalList = null;
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

		var keys = Object.keys(finalList);
		if (keys.length > 0) {
			device = finalList[keys[0]];
		}
		
		res.render('finalList', {
			title: '最新資訊',
			finalList:finalList
		});
  });

  app.get('/devices', function (req, res) {
		var	mac = req.query.mac;
		var	date = req.query.date;
		var	option = req.query.option;
		var checkMap = null;
		var finalList = null;
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
		checkMap = JsonFileTools.getJsonFromFile(path2);
		let obj = finalList[mac];
		var keys = Object.keys(obj.information);
		let type = obj.type;
		let fieldName = checkMap[type]['fieldName'];
		let field = [];
		for(let i=0; i<keys.length;i++) {
			field.push(fieldName[keys[i]]);
		}
        

		res.render('devices', {
			title: '裝置列表',
			field: field,
			mac:mac,
			date: date,
			test: test,
			option
		});
  });
};