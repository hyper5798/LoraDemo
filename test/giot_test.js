var mqtt = require('mqtt');

var hostname = '52.193.146.103';
var portNumber = 80;
var client_Id = '200000109-generic-service_66';
var name = '200000109';
var pw = '57381042';
var topic = 'client/200000109/200000109-GIOT-MAKER';

var options = {
  host: hostname,
	port:portNumber,
  clientId:client_Id,
  username:name,
  password:pw,
  //keepalive: 0,
	//reconnectPeriod: 1000,
	protocolId: 'MQIsdp',
	protocolVersion: 3,
	//clean: true,
	encoding: 'utf8'
};


var client = mqtt.connect(options);

console.log(new Date+'connect scbscribe topic:'+topic);
client.on('connect', function()  {
  console.log(new Date+'connect...');
	client.subscribe(topic);
});

client.on('message', function(topic, message) {

  console.log('topic:'+topic);
  console.log('message:'+message.toString());
  
});

client.on('disconnect', function() {
  console.log('mqtt disconnect' );
});

