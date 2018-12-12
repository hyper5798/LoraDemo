var mqtt = require('mqtt');
var settings = require('../settings');

var options = {
	port:settings.gIotPort,
    host: settings.gIotHost,
    clientId:settings.client_Id,
    username:settings.name,
    password:settings.pw,
    keepalive: 0,
	reconnectPeriod: 1000,
	protocolId: 'MQIsdp',
	protocolVersion: 3,
	//clean: false
};
console.log('giotClient port:'+options.port);
console.log('giotClient host:'+options.host);
console.log('giotClient clientId:'+options.clientId);
console.log('giotClient username:'+options.username);
console.log('giotClient password:'+options.password);

var GIotClient = mqtt.connect(options);

module.exports = GIotClient;