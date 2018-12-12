var express = require('express');
var router = express.Router();
//var UnitDbTools = require('../models/unitDbTools.js');
var Device = require('../models/device.js');
var user = require('../models/user.js');
var moment = require('moment');

router.route('/devices')

   .get(function(req, res) {
		var mac    = req.query.mac;
		var option = req.query.option;
		var date  = req.query.date;
		Device.findDevicesByDate(date,mac,Number(option),'asc',function(err,devices){
		    if (err)
				return res.send(err);
			return res.json(devices);
		});
	})


router.route('/devices/:mac')

	// get the bear with that id
	.get(function(req, res) {
		Device.findByMac(req.params.mac, function(err, devices) {
			if (err)
				return res.send(err);
			return res.json(devices);
		});
	})

router.route('/users')

	// get the bear with that id
	.get(function(req, res) {
		user.findAllUsers(function(err, users) {
			if (err)
				return res.send(err);
			return res.json(users);
		});
	})

	// create the user
	.post(function(req, res) {
		var name = req.body.name;
		var password = req.body.password;
		//To update devices by mac
		user.saveUser(name,password, function(err, result){
			if (err) {
				return res.send(err);
			}
			return res.json(result);
		})
	})

	// update the data with this id
	.put(function(req, res) {
		var name = req.body.name;
		var pw = req.body.password;
		var json = {password: pw};
		//To update user by name
		user.updateUser (name, json, function(err, result){
			if (err) {
				return res.send(err);
			}
			return res.json(result);
		})
	})

	// delete the bear with this id
	.delete(function(req, res) {
        var name = req.body.name;
		//To delete user by name
		user.removeUserByName (name, function(err, result){
			if (err) {
				return res.send(err);
			}
			return res.json(result);
		})
	});

router.route('/setting')

	// get the bear with that id
	.get(function(req, res) {
		Device.findByMac(req.params.mac, function(err, devices) {
			if (err)
				return res.send(err);
			return res.json(devices);
		});
	})

	// update the data with this id
	.put(function(req, res) {
		 var mac = req.params.mac;
		//To update devices by mac
	})

	// delete the bear with this id
	.delete(function(req, res) {
        var mac = req.params.mac;
		//To delete devices by mac
	});

module.exports = router;