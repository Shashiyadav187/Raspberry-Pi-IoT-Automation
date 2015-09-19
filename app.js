
var server = require('http').Server(app);
var express = require('express');
var io = require('socket.io')(server);//create io object with an http/express server using socket.io module
var path = require('path'); //built in path module, used to resolve paths of relative files
var port = 3000; //stores port number to listen on
var device = require('./private/device.json');//imports device object
var usr_auth = require ('./private/auth.json');//creates an object with user name and pass and 
//var Gpio = require('onoff').Gpio; //module allows Node to control gpio pins, must be installed with npm
var schedule = require('node-schedule');//npm installed scheduling module
var jobs = [];//stores all the jobs that are currently active

//mongodb requirements
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require("./database/db") //for schema structures
var index = require('./database/routes/index'); //for api functions

var app = express(); //express module must be installed using NPM

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})
app.use(app.router);


//////////////////
// BUILD SERVER
//////////////////
server.listen(port);// note implement process.env.port
app.get('/', auth);

console.log("Now listening on port " + port); //write to the console which port is being used


//////////////////
// ERROR CATCHING
//////////////////
// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    //if (req.is('text/*')) {
    //    req.text = '';
    //    req.setEncoding('utf8');
    //    req.on('data', function (chunk) { req.text += chunk });
    //    req.on('end', next);
    //} else {
    //    next();
    //}
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//////////////////
// AUTHENTICATOR
//////////////////
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


////////////////////////////////////
//	START WEBSOCKET FUNCTIONS     //
////////////////////////////////////
/* io.on('connection', function (socket) {//this function is run each time a clients connects (on the connection event)
	console.log("New Connection from IP: " + socket.request.connection.remoteAddress + "\t" + io.engine.clientsCount + " socket(s) connected");
	for(var x = 0; x < device.length; x++){
		if (device[x].state == "out"){
			socket.emit('addOutput', { "name" : device[x].name, "id" : x }); //on receipt the browser will multiply the id by 10 (and add 1 or zero for on/ off), on buttonclick the id will be sent back we can use integer division to get the device index, and modulus to get the state
		}
		else if (device[x].state == "in"){
			socket.emit('addInput', { "name" : device[x].name, "id" : x });//tell server to draw the sensor on webpage'
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
  });
});

//initialize devices
for(var x = 0; x < device.length; x++){
	if (device[x].state == "in"){
			device[x].dev = new Gpio(device[x].pin, 'in', 'both');//create a key within the device[x] object that stores the GPIO object of the corresponding device
		(function(index){//create a wrapper function so that the x value can be passed into the callback at the time the callback is initiated
			device[index].dev.watch(function (err, value) {
				if (err) {throw err;}
				if (value == 1){ io.emit('inputUpdate', { "id" : index * 10 + 2, "msg" : device[index].highmsg, "val" : value });}
				if (value == 0){ io.emit('inputUpdate', { "id" : index * 10 + 2, "msg" : device[index].lowmsg, "val" : value });}
				console.log("\t" + device[index].name + " current Value: " + value);
			});
		})(x);//passing x to index parameter of anonymous function
	}
	
	else if (device[x].state == "out"){
			device[x].dev = new Gpio(device[x].pin, 'out');
	}
	if (x == device.length - 1) {console.log("Devices initialized");}
}

function setOutput(data){
	if(data.constructor === Array){//arrays are passed when scheduled events include multiple items
		for(var z = 0; z < data.length; z++){
			var x = Math.floor(data[z] / 10);//finds the device array index of the operation
			var y = (data[z] % 10)-3;//finds the value to be written (which is 1 or zero and is stored in the ones place)
			device[x].dev.writeSync(y);
			console.log(device[x].name + " set to : " + y);
		}		
	}
	else{
		var x = Math.floor(data / 10);//finds the device array index of the operation
		var y = data % 10;//finds the value to be written (which is 1 or zero and is stored in the ones place)
		device[x].dev.writeSync(y);
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
	for (var x = 0; x < device.length; x++){
		device[x].dev.unexport();
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
   */
////////////////////////////////////
//	END WEBSOCKET FUNCTIONS       //
////////////////////////////////////


////////////////////////////////////
//	START API FUNCTIONS           //
////////////////////////////////////

app.get('/getEvents', index.addEvent);
app.get('/getSensors', index.addEvent);
app.get('/getData/:id', index.addEvent);
app.post('/addEvent', index.addEvent);
app.post('/addSensor', index.addSensor);
app.post('/addData', index.addData);
app.set('/setEvent/:id', index.setEvent);
app.set('/setSensor/:id', index.setSensor);
app.delete('/delEvent/:id', index.delEvent);
app.delete('/delSensor/:id', index.delSensor);

module.exports = app;

////////////////////////////////////
//	END API FUNCTIONS             //
////////////////////////////////////
 