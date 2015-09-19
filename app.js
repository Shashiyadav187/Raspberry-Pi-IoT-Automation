var express = require('express');
var app = express(); //express module must be installed using NPM
var server = require('http').Server(app);
var io = require('socket.io')(server);//create io object with an http/express server using socket.io module
var path = require('path'); //built in path module, used to resolve paths of relative files
var port = 3700; //stores port number to listen on
var device = require('./private/device.json');//imports device object
var usr_auth = require ('./private/auth.json');//creates an object with user name and pass and 
var Gpio = require('onoff').Gpio; //module allows Node to control gpio pins, must be installed with npm
var schedule = require('node-schedule');//npm installed scheduling module
var ngrok = require('ngrok');
var fs = require('filestream');
var jobs = [];//stores all the jobs that are currently active

//build server functionality
server.listen(port);// note implement process.env.port
app.get('/', auth);

console.log("Now listening on port " + port); //write to the console which port is being used

ngrok.connect({
    proto: 'http', // http|tcp|tls 
    addr: port, // port or network address 
    auth: usr_auth.name + ':' + usr_auth.pass, // http basic authentication for tunnel 
    authtoken: '25EXQ1aRd7bPCojUdYSzx_FAFBqjmJ5BhmsMLZtVVM' // your authtoken from ngrok.com 
}, function (err, url) {
	console.log("URL: " + url);
	if(err)	console.log("NGROK ERR: " + err);
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
}

//build websocket functionality
io.on('connection', function (socket) {//this function is run each time a clients connects (on the connection event)
	console.log("New Connection from IP: " + socket.request.connection.remoteAddress + "\t" + io.engine.clientsCount + " socket(s) connected");
	socket.emit('device', device);//send device variable from device.json (MUST BE FIRST THING SENT)
	for(var x = 0; x < device.length; x++){
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
	for(var x=0; x < jobs.length; x++){
		socket.emit('addEvent', jobs[x]);
	}
	socket.on('disconnect', function(){
	  console.log("End Connection from IP: " + socket.request.connection.remoteAddress + "\t" + io.engine.clientsCount + " socket(s) connected");
	  
	  
	//write log for callback
	socket.on('addLog', function(socket) {
		console.log("Writing log from: " + socket.request.connection.ip);
		fs.appendFile('./log.txt', socket.request.connection.datetime + "," + socket.request.connection.devicename + "," + socket.request.connection.deviceid + "," + socket.request.connection.val + "," + socket.request.connection.ip + "\n", function (err) {console.log("Err writing log")});
	});
  });
});

//initialize devices
var pin = [];//array stores the GPIO module objects, the index corresponds to the gpio pin on the pi that the device is connected to (there are 26 GPIO's on pi, but the highest GPIO pin is 27)
for(var x = 0; x < device.length; x++){
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
				if (pinstate == 1){ io.emit('inputUpdate', { "id" : x * 10 + 2, "msg" : device[x].highmsg, "val" : value });}
				else if (pinstate == 0){ io.emit('inputUpdate', { "id" : x * 10 + 2, "msg" : device[x].highmsg, "val" : value });}
				
	}
	
	else if (device[x].state == "out"){
			pin[device[x].pin] = new Gpio(device[x].pin, 'out');
	}
	if (x == device.length - 1) {console.log("Devices initialized");}
}

function setOutput(data){
	if(data.constructor === Array){//arrays are passed when scheduled events include multiple items
		for(var z = 0; z < data.length; z++){
			var x = Math.floor(data[z] / 10);//finds the device array index of the operation
			var y = (data[z] % 10)-3;//finds the value to be written (which is 1 or zero and is stored in the ones place)
			pin[device[x].pin].writeSync(y);
			io.emit('outdate', x, y);//output update, if anyone chnages the state of a light, all clients should see that change
			console.log(device[x].name + " set to : " + y);
		}		
	}
	else{
		var x = Math.floor(data / 10);//finds the device array index of the operation
		var y = data % 10;//finds the value to be written (which is 1 or zero and is stored in the ones place)
		pin[device[x].pin].writeSync(y);
		io.emit('outdate', x, y);//output update
		console.log(device[x].name + " set to : " + y);
	}
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
		var deviceindex = Math.floor((data.op[x] - 3) / 10);
		var devicestate = (data.op[x] - 3) % 10;
		jobs[index].op[x] = device[deviceindex].id +" state: " + devicestate;
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
 
function exitDevices() {//function unexports all Gpio objects
	
	//kill ngrok
	ngrok.disconnect(); // stops all 
	ngrok.kill(); // kills ngrok process 
	
	//move pins to main raspi thread
	for (var x = 0; x < device.length; x++){
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
 