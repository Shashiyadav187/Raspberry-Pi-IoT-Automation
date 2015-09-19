var mongoose = require("mongoose");
var events = mongoose.model('event');
var sensors = mongoose.model('sensor');
var sensor_data = mongoose.model('sensor_data')


exports.getEvents = function (req, res) {
    events.find({},function (err, gotEvents) {
		if(err) {
			console.log("\n\nERR API getEvents: \n\n" + err)
            res.send(err);
		} else {
			res.send(gotEvents);
		}
	});
};

exports.getSensors = function (req, res) {
    sensors.find({},function (err, gotSensors) {
		if(err) {
			console.log("\n\nERR API getSensors: \n\n" + err)
            res.send(err);
		} else {
			res.send(gotSensors);
		}
	});
};

exports.getData = function (req, res) {
    sensor_data.find({_id:  req.params.id },function (err, gotData) {
		if(err) {
			console.log("\n\nERR API getData: \n\n" + err)
            res.send(err);
		} else {
			res.send(gotData);
		}
	});
};

exports.addEvent = function (req, res) {
    var event = new events({
        conditional_type: req.body.conditional_type,
        sensors_to_turn_on: req.body.sensors_to_turn_on,
        sensors_to_turn_off: req.body.sensors_to_turn_off,
        sensors_to_toggle: req.body.sensors_to_toggle,
        times_to_execute: req.body.times_to_execute,
        is_reoccuring: req.body.Boolean
	});
	
	event.save(function () {
		res.send("EVENT ADD SUCCESS");
	});
};

exports.addSensor = function (req, res) {
    var sensor = new sensors({
        name: req.body.name,
        is_input: req.body.is_input,
        is_output: req.body.is_output
	});
	
	sensor.save(function () {
		res.send("SENSOR ADD SUCCESS");
	});
};

exports.addData = function (req, res) {
    var sensor_data = new sensor_data({
        sensor: sensor,
        data: Number
	});
	
	sensor_data.save(function () {
		res.send("DATA ADD SUCCESS");
	});
};

exports.setSensor = function (req, res) {
	sensors.update({ _id: req.params.id }, function(err, gotSensor) {
		if(err) {
			console.log("\n\nERR API setSensor: \n\n" + err)
            res.send(err);
		} else {
			gotSensor = new sensors({
				name: req.body.name,
				is_input: req.body.is_input,
				is_output: req.body.is_output
			});
			
			res.send("SENSOR SET SUCCESS");
		}
	});
};

exports.setEvent = function (req, res) {
	sensors.update({ _id: req.params.id }, function(err, gotEvent) {
		if(err) {
			console.log("\n\nERR API setEvent: \n\n" + err)
            res.send(err);
		} else {
			gotEvent = new events({
				conditional_type: req.body.conditional_type,
				sensors_to_turn_on: req.body.sensors_to_turn_on,
				sensors_to_turn_off: req.body.sensors_to_turn_off,
				sensors_to_toggle: req.body.sensors_to_toggle,
				times_to_execute: req.body.times_to_execute,
				is_reoccuring: req.body.Boolean
			});
			
			res.send("EVENT SET SUCCESS");
		}
	});
};

exports.delSensor = function (req, res) {
	sensors.remove({ _id: req.params.id}, function(err, gotSensor) {
		if(err) {
			console.log("\n\nERR API delSensor: \n\n" + err)
            res.send(err);
		} else {
			res.send("SENSOR DEL SUCCESS");
		}
	});
};

exports.delEvent = function (req, res) {
	sensors.remove({ _id: req.params.id}, function(err, gotEvent) {
		if(err) {
			console.log("\n\nERR API delEvent: \n\n" + err)
            res.send(err);
		} else {
			res.send("EVENT DEL SUCCESS");
		}
	});
};