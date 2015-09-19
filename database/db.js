var mongoose = require('mongoose')
var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var db_url = "mongodb://localhost:27017/sensorServer"
var db = mongoose.connect(db_url);
//var db = mongoose.connect(db_url).connection;

/* db.on('error', function(err) { console.log("err: " + err.message); });
db.once('open', function() {
  console.log("mongodb connection open");
}); */

//sensor schema
var sensor_schema = new Schema({
    id: ObjectId,
	name: { type: String, required: true },
	is_input: Boolean,
	is_output: Boolean,
	date_added: { type: Date, default: Date.now }
})

var sensor = db.model('sensor', sensor_schema, 'sensor');


//sensor data schema
var sensor_data_schema = new Schema({
    id: ObjectId,
	sensor: ObjectId,
	timestamp: { type: Date, default: Date.now },
	data: Number
})

var sensor_data = db.model('sensor_data', sensor_data_schema, 'sensor_data');

//event schema
var event_schema = new Schema({
    id: ObjectId,
    conditional_type: String,
	sensors_to_turn_on: [ObjectId],
	sensors_to_turn_off: [ObjectId],
	sensors_to_toggle: [ObjectId],
	times_to_execute: [Date],
	is_reoccuring: Boolean
})

var event = db.model('event', event_schema, 'event');

