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
		var devices = {},
		    selectedType = null,
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
		var checkMap = JsonFileTools.getJsonFromFile(path2);
		var maps = Object.values(checkMap);

		var keys2 = Object.keys(finalList);
		for(let i=0;i < keys2.length; i++) {
			let mac = keys2[i];
			
			let obj = finalList[mac];
			let type = obj.type;
			if(i==0){
				selectedType = type;
			}
			if(devices[type] === undefined) {
				devices[type] = [];
			}
			devices[type].push(obj);
		}

		res.render('finalList', {
			title: '最新資訊',
			finalList: devices[selectedType],
			devices: devices,
			maps: maps
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