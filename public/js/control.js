//all the socket on stuff should be in main file, the functions should be here
//after everything has been improved of course
var devices;//global array that is the same as the array in the app.js and as is saved in device.json
var socket = io();

socket.on('device', deviceobject);//global object
function deviceobject(dev){
	devices = dev;
	$('#output_div')[0].innerHTML = "";
	$('#input_div')[0].innerHTML = "";
	for(var i = 0; i < devices.length; i++) {
		var name = devices[i].name;
		var state = devices[i].state;
		var active = devices[i].active;
		var highmsg = devices[i].highmsg;
		var lowmsg = devices[i].lowmsg;
		var checked = "";
		
		if(state == "out") {
			//for output
			id = i*10 + 2;
			if(active == "high") checked = "checked"
			
			$('#input_div')[0].innerHTML = $('#input_div')[0].innerHTML + '<div style="margin:20px" ><input onclick="setOutput(this.id, this.checked);" id="' + id + '"  type="checkbox" ' + checked + '><p>' + name + '</p></div>'
		} else {
			//for input
			id = i*10;
			var active = true;
			var className;
			if(active) {
				checked = highmsg
				className = "list-group-item-success";
			}
			else {
				checked = lowmsg
				className = "list-group-item-danger";
			}
			
			$('#output_div')[0].innerHTML = $('#output_div')[0].innerHTML + '<a id="' + id + '" href="#" style="text-align: center;" class="list-group-item ' + className + '">' + checked + '</a><br/>'
		}
	}
}

function setOutput(id, state){
	var ids = id;//the ones place corresponds to the operation to be performed (all id's have been multiplied by 10)
	if(state == true) ids++;//if the checkbox has been checked, set the ones place equal to 1, indicating that the on operation
	socket.emit('setOutput', ids);
	socket.emit('addLog',{ "ids" : ids, "state" : state})
}
	/*
function enableEvent(id)//runs when area surrounding an event switch is selected
{
		//var event = document.getElementById("eventOptions");
		var check = document.getElementById(id).checked;
		if(check == true)
		{
			check = false;
			check.parentElement.setAttribute("class", "output");
		}
		else
		{
			check = true;
			check.parentElement.setAttribute("class", "output onclick-eventselect");
		}
}
*/
socket.on('addInput', addInput);
function addInput(data){
	var id = data.id * 10 + 2
	var div = document.getElementById("div-sensors").appendChild(document.createElement("DIV"));
	if(data.val == 0)	{ div.setAttribute("class", "state state-low");}
	else if(data.val == 1)	{ div.setAttribute("class", "state state-high");}//reflect current state of pin on GUI
	else { div.setAttribute("class", "state"); }

	//var leftdiv = document.createElement("DIV");
	//	leftdiv.setAttribute("class", "pure-u-1-2 left-div");
	var d1 = document.createElement("DIV");
	var name = document.createTextNode(data.name);
	d1.appendChild(name);
	div.appendChild(d1);

	var d2 = document.createElement("DIV");
	var status = document.createTextNode("NULL");
	d2.setAttribute("id", id);
	d2.appendChild(status);
	div.appendChild(d2);


    //return for log file
	//socket.emit('addLog', { "datetime": new Date(), "devicename": device[x].name, "deviceid": x, "val": val, "ip": myip })

}

socket.on('addEvent', addEvent);
function addEvent(data){
	var div = document.getElementById("upcomingEvents").appendChild(document.createElement("DIV"));
		div.setAttribute("id", data.id);//set name of the div element that will contain this event equal to the time, device, and operation so that it can easily be accessed
		div.setAttribute("class", "pure-g");

	var leftdiv = document.createElement("DIV");
		leftdiv.setAttribute("class", "pure-u-9-24");
		leftdiv.appendChild(document.createTextNode(data.date));
		div.appendChild(leftdiv);

	var middiv = document.createElement("DIV");
		middiv.setAttribute("class", "pure-u-9-24");
		for(var x = 0; x < data.op.length; x++){
			middiv.appendChild(document.createTextNode(data.op[x]));
			middiv.appendChild(document.createElement("BR"));
		}
		div.appendChild(middiv);

	var rightdiv = document.createElement("DIV");
		rightdiv.setAttribute("class", "pure-u-6-24");
	var removeButton = document.createElement("button");
		removeButton.setAttribute("class", "pure-button button-small");
		removeButton.setAttribute("type", "button");
		removeButton.innerHTML = "remove";
		removeButton.setAttribute("name", data.id);
		removeButton.setAttribute("onclick", "cancelEvent(this.name);");
		rightdiv.appendChild(removeButton);
		div.appendChild(rightdiv);
}
function cancelEvent(jobid){
	socket.emit('cancelEvent', jobid);
}
socket.on('undrawEvent', undrawEvent);
function undrawEvent(jobid){
	document.getElementById(jobid).remove();
}

function newEvent(){
	var repeat; //stores integer 0-5 to represent the repetition type, respectively once, hourly, daily, weekly, monthly, yearly
	var date;//will store that date object entered by user into datetime-locale element
	var operations = [];//stores an array of the operations that will occur during this event
	for(var x = 0; x < 6; x++){
		var r = document.getElementById("repeat" + x).checked;
		if(r == true){
			repeat = x;
		}}

	var datetime = document.getElementById("eventTimeDate").value;//get date time string from datetime-locale element
		var datetimearray = datetime.split("T");//split the datetime string on the T
		var datearr = datetimearray[0].split("-");//creates array of 3 value corresponding to year, month, hour respectively (Note month is returned 1 through 12, however the new Date object index the month at 0) therefore we must subtract 1
		var time = datetimearray[1].split(":");//creates array of 2 values corresponding to hour and minute respectively
	date = new Date(datearr[0], datearr[1] -1, datearr[2], time[0], time[1]);//create a date object

	var inputarr = document.getElementsByClassName("onoff-container event");//get all event switches
	for(var x = 0; x < inputarr.length; x++){//find which events are selected for that date and time
		var chkbox_select = inputarr[x].parentElement.children[0].children[0];
		var chkbox = inputarr[x].children[0].children[0]
		if (chkbox_select.checked == true)
		{
			if (chkbox.checked == true)
			{
				operations.push(parseInt(chkbox.id + 1));
			}
			else
			{
				operations.push(parseInt(chkbox.id));
			}
		}
	}
	socket.emit('newEvent', { "date" : date.getTime(), "repeat" : repeat, "op" : operations});
}

socket.on('inputUpdate', inputUpdate);
function inputUpdate(data){//function edits the fields of each sensor with javascript
	var div = document.getElementById(data.id);//no other element should have the sensors index as defined in the device.js file
	div.replaceChild(document.createTextNode(data.msg), div.childNodes[0]);
	var div_state = div.parentElement
	if(data.val == 1) { div_state.setAttribute("class", "state state-high");}
	else { div_state.setAttribute("class", "state state-low");}
}
socket.on('outdate', outdate);//output update
function outdate(x, y){
	var id = (x * 10);
	var check = document.getElementById(id);
	if(y == 1) check.checked = true;
	else if (y == 0) check.checked = false;
}