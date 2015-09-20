var express = require('express');
var app = express(); //express module must be installed using NPM
var server = require('http').Server(app);
var io = require('socket.io')(server);//create io object with an http/express server using socket.io module
var path = require('path'); //built in path module, used to resolve paths of relative files
var device = require('./private/device.json');//imports device object
var usr_auth = require ('./private/auth.json');//creates an object with user name and pass and
var Gpio = require('onoff').Gpio; //module allows Node to control gpio pins, must be installed with npm
var schedule = require('node-schedule');//npm installed scheduling module
var ngrok = require('ngrok');
var fs = require('fs');
var util = require('util');
var nodemailer = require('nodemailer');
var jobs = [];//stores all the jobs that are currently active
var email = require('./private/email.json');
var ngrok_obj = require('./private/ngrok.json');

//build server functionality
server.listen(ngrok_obj.addr);// note implement process.env.port
console.log("now listening on " + ngrok_obj.addr);
app.get('/', auth);

//console.log("Now listening on port " + port); //write to the console which port is being used

ngrok.connect(ngrok_obj, function (err, url) {
	if(err)	console.log("NGROK ERR: " + err);
	else console.log("URL: " + url);
});

// Authenticator
var basicAuth = require('basic-auth');
function auth (req, res) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === usr_auth.name && user.pass === usr_auth.pass) { //compare to auth.json file values
    return post_auth(req, res);
  } else {
    return unauthorized(res);
  };
};
//once user authentication is established
function post_auth (req, res) {
    res.sendFile(path.join(__dirname, '/public/control.html'));
	app.use(express.static(path.join(__dirname + '/public'))); //serves static content stored inside public directory
	app.use(express.static(path.join(__dirname + '/images')));//serves pictures
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	console.log("Login from: " + ip);
}

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(email.login);

//build websocket functionality
io.on('connection', function (socket) {//this function is run each time a clients connects (on the connection event)
	writeConnLog("connect," + socket.handshake.headers['x-forwarded-for'] + ","
		+ io.engine.clientsCount + "," + socket.handshake.headers.host + ","
		+ socket.handshake.headers['user-agent'] + "," + socket.handshake.headers['accept-language']);


	socket.emit('device', device);//send device variable from device.json (MUST BE FIRST THING SENT)
	for(var x = 1; x < device.length; x++){
		var val = pin[device[x].pin].readSync();
		if (device[x].state == "out"){
			socket.emit('addOutput', { "name" : device[x].name, "id" : x, "val" : val }); //on receipt the browser will multiply the id by 10 (and add 1 or zero for on/ off), on buttonclick the id will be sent back we can use integer division to get the device index, and modulus to get the state
		}
		else if (device[x].state == "in"){
			socket.emit('addInput', { "name" : device[x].name, "id" : x, "val" : val });//tell server to draw the sensor on webpage'
		}
	}


	//socket.emit('addEvent', {"job" : 123456, "date" : "Every Monday at 10:25AM", "op" : [ "PIR on", "Light on"]});
	socket.on('setOutput', setOutput);
	socket.on('cancelEvent', cancelEvent);
	socket.on('newEvent', newEvent);
	socket.on('takepic', function(){
		picture();
		emailPicture("sn.bailey11@gmail.com");
		console.log("picture emailed");
	});
	for(var x=0; x < jobs.length; x++){
		socket.emit('addEvent', jobs[x]);
	}


	socket.on('disconnect', function(){
	writeConnLog("disconnect," + socket.handshake.headers['x-forwarded-for'] + ","
		+ io.engine.clientsCount + "," + socket.handshake.headers.host + ","
		+ socket.handshake.headers['user-agent'] + "," + socket.handshake.headers['accept-language']);
	});

});

//initialize devices
var pin = [];//array stores the GPIO module objects, the index corresponds to the gpio pin on the pi that the device is connected to (there are 26 GPIO's on pi, but the highest GPIO pin is 27)
for(var x = 1; x < device.length; x++){
	if (device[x].state == "in"){
			pin[device[x].pin] = new Gpio(device[x].pin, 'in', 'both');//create a key within the device[x] object that stores the GPIO object of the corresponding device
		(function(index){//create a wrapper function so that the x value can be passed into the callback at the time the callback is initiated
			pin[device[x].pin].watch(function (err, value) {
				if (err) {throw err;}
				else if (value == 1){ io.emit('inputUpdate', { "id" : index * 10 + 2, "msg" : device[index].highmsg, "val" : value });}
				else if (value == 0){ io.emit('inputUpdate', { "id" : index * 10 + 2, "msg" : device[index].lowmsg, "val" : value });}
				console.log("\t" + device[index].name + " current Value: " + value);
			});
		})(x);//passing x to index parameter of anonymous function
		var pinstate = pin[device[x].pin].readSync();
		io.emit('inputUpdate', { "id" : x * 10 + 2, "msg" : device[x].highmsg, "val" : pinstate });
	}

	else if (device[x].state == "out"){
			pin[device[x].pin] = new Gpio(device[x].pin, 'out');
	}
	if (x == device.length - 1) {console.log("Devices initialized");}
}
//initialize camera if device file specifies "true"
if(device[0].camera == "true") {
	var cameraOptions = { // options for the camera from device.json
    mode : "photo",
	height : device[0].height,
	width : device[0].width,
	quality : device[0].quality,
	timeout : device[0].timeout,
    output      : 'images/img0.jpg'
	};
	// start it up
	var camera = new require("raspicam")(cameraOptions);

	// go to website/pic to see image
	app.get('/pic', function(req, res)
	{
	res.sendFile(__dirname + './images/img0.jpg');
	});
}

function setOutput(data){
	if(data.constructor === Array){//arrays are passed when scheduled events include multiple items
	var csv;//stores comma separated name:state of devices in a string to write to log file and emit to UI
		for(var z = 0; z < data.length; z++){
			var x = Math.floor(data[z] / 10);//finds the device array index of the operation
			var y = (data[z] % 10)-2;//finds the value to be written (which is 1 or zero and is stored in the ones place)
			pin[device[x].pin].writeSync(y);
			console.log(x);
			io.emit('outdate', x, y);//output update, if anyone chnages the state of a light, all clients should see that change
			if (z == 0) csv = device[x].name + ":" + y + ",";
			else if (z < (data.length - 1)) csv += device[x].name + ":" + y + ",";
			else csv += device[x].name + ":" + y;
		}
	}
	else{
		var x = Math.floor(data / 10);//finds the device array index of the operation
		var y = data % 10;//finds the value to be written (which is 1 or zero and is stored in the ones place)
		pin[device[x].pin].writeSync(y);
		io.emit('outdate', x, y);//output update
		console.log(device[x].name + " set to : " + y);
		csv = device[x].name + ":" + y;
	}
	writeEventLog(csv);
}
function newEvent(data){
	var index = jobs.length;
	var date_event = new Date(data.date);
	//console.log(JSON.stringify(schedule.scheduleJob(date_event, function(){ console.log("hi");})));
	var operations = data.op.slice(0);//slice method returns the array, makes a copy
	console.log("Job scheduled for " + date_event.toLocaleDateString() + ", " + date_event.toLocaleTimeString());
	var job_id = date_event.toJSON();//id string to be used as id property of event when displayed in html doc
	for(var x = 0; x < data.op.length; x++){
		job_id = job_id.concat(";");
		job_id = job_id.concat(data.op[x]);
	}
	if(data.repeat == 0){ //for one time events
		(function (x, date, ops, _job_id){//function wrapper
				jobs.push({"job" : schedule.scheduleJob(date, function(){
					setOutput(ops);
					jobs.splice(x, 1);
					io.emit("undrawEvent", _job_id);
					console.log("Jobs remaining: " + jobs.length);
				}), "date" : date.toLocaleDateString() + ", " + date.toLocaleTimeString(), "op" : ""})
		})(index, date_event, operations, job_id);
	}
	for(var x = 0; x < data.op.length; x++)
	{
		var deviceindex = Math.floor(data.op[x] / 10);
		var devicestate = (data.op[x] - 2) % 10;
		console.log(deviceindex);
		jobs[index].op[x] = device[deviceindex].name +" state: " + devicestate;
	}
	jobs[index].id = job_id;
	io.emit('addEvent', jobs[index]);
}
function cancelEvent(data) {
	var indx = -1;//stores the value of the index of the job to be canceled
	for(var n = 0; n < jobs.length; n++)
	{
		if(jobs[n].id == data)//if the strings match
		{
			indx = n;
		}
	}
	jobs[indx].job.cancel();
	io.emit('undrawEvent', data);
	console.log("Job ID " + data + " canceled");
}

function exitDevices() {//function unexports all Gpio objects, and kills ngrok

	//kill ngrok
	ngrok.disconnect(); // stops all
	ngrok.kill(); // kills ngrok process

	//move pins to main raspi thread
	for (var x = 1; x < device.length; x++){
		pin[device[x].pin].unexport();
	}
	console.log("all devices unexported");
	server.close();
	console.log("Server closed");
}

//on following exit events the exit function will be run to close (unexport) open gpio ports
process.on('cleanup', exitDevices);
 process.on('exit', function () {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', function () {
    console.log('Ctrl-C...');
    process.exit(2);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function(e) {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
  });
  
  
function writeConnLog(string){//connections log file
	var now = new Date();
	fs.appendFile("connections.log", now + "," + string + '\n', function(err) {
		if(err) { return console.log(err); }
		else console.log("Connection Log: " + now + "," + string + '\n')
	});
}
function writeEventLog(string){//event log file, and socket emit for text log on site
	var now = new Date();
	fs.appendFile("events.log", now + "," + string + '\n', function(err) {
		if(err) {return console.log(err);}
		else console.log("Event Log: " + now + "," + string + '\n');
		console.log(string);//debug
	});
	io.emit('log', now, string);//emit log to all sockets so that their sites are up to date 
}
function picture(){//takes a picture
	//camera events
	var img_path;
	camera.on('start', function(err, timestamp)
	{
		if(err != null) console.log(err);
	});
	camera.on('read', function(err, timestamp, path)
	{
		if(err != null) console.log(err);
		img_path = path;
	});
	camera.on('exit', function(timestamp)
	{
		camera.stop();
		return img_path;
	});
	camera.start();
}
function emailPicture(email){
		transporter.sendMail(
	{       sender: 'raspberry.pi.iot.automation@gmail.com',
			to:email,
			subject:'Photo taken!',
			body:'',
			html: 'Embedded image:<br><img src="cid:unique@kreata.ee"/>',
		attachments: [{
			filename: 'img.jpg',
			path: "./images/img0.jpg",
			cid: 'unique@kreata.ee' //same cid value as in the html img src
		}]

	},function(error, info){
		if(error) console.log(error);
	});
}