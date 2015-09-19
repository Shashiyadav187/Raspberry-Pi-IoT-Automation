//all the socket on stuff should be in main file, the functions should be here
//after everything has been improved of course
var device;//global array that is the same as the array in the app.js and as is saved in device.json
var socket = io();

socket.on('device', deviceobject);//global object
function deviceobject(dev){
	device = dev;
}
socket.on('addOutput', addOutput);
function addOutput(data){//draws buttons and scheduling devices on screen
	var id = data.id * 10;
	var tr = document.getElementById("div-output").appendChild(document.createElement("TR"));
	tr.setAttribute("class", "output");
	
	var leftdiv = document.createElement("TD");
		leftdiv.setAttribute("class", "label");
		leftdiv.appendChild(document.createTextNode(data.name + ":"));
	tr.appendChild(leftdiv);
	
	var rightdiv = document.createElement("TD");
	rightdiv.setAttribute("class", "onoff-container");
	
	/*var onoffswitch = document.createElement("DIV");
		onoffswitch.setAttribute("class", "onoffswitch");
	var onoffswitchinput = document.createElement("input");
		onoffswitchinput.setAttribute("type", "checkbox");
		onoffswitchinput.setAttribute("name", "onoffswitch");
		onoffswitchinput.setAttribute("class", "onoffswitch-checkbox");
		onoffswitchinput.setAttribute("id", id);
		onoffswitchinput.setAttribute("onclick", "setOutput(this.id, this.checked);");
	onoffswitch.appendChild(onoffswitchinput);
	var onoffswitchlabel = document.createElement("label");
		onoffswitchlabel.setAttribute("class", "onoffswitch-label");
		onoffswitchlabel.setAttribute("for", id);
	onoffswitch.appendChild(onoffswitchlabel);
	var onoffswitchspani = document.createElement("span");
		onoffswitchspani.setAttribute("class", "onoffswitch-inner");
	onoffswitchlabel.appendChild(onoffswitchspani);
	var onoffswitchspans = document.createElement("span");
		onoffswitchspans.setAttribute("class", "onoffswitch-switch");
	onoffswitchlabel.appendChild(onoffswitchspans);
		*/
	var onoffswitch1 = createOnOffSwitch(id, "setOutput(this.id, this.checked);");
	rightdiv.appendChild(onoffswitch1);
	tr.appendChild(rightdiv);
	
		//now write options for event scheduling
	var eventdiv = document.getElementById("eventOptions").appendChild(document.createElement("TR"));
	eventdiv.setAttribute("name", "event-schedule");
	eventdiv.setAttribute("class", "output");
	
	var lefteventdiv = eventdiv.appendChild(document.createElement("TD"));
	lefteventdiv.setAttribute("class", "label");
	var eventcheck = document.createElement("input");
	eventcheck.setAttribute("type", "checkbox");
	eventcheck.setAttribute("style", "display:none;");
	eventcheck.setAttribute("id", id+4);
	console.log(data.val);//debug
	var eventname = document.createTextNode(data.name + ": ");
	lefteventdiv.appendChild(eventname);
	lefteventdiv.appendChild(eventcheck);
	var checkbox = document.getElementById(id+4);
	if (data.val == 1) {checkbox.checked = true;}
	else if (data.val == 0) {checkbox.checked = false;}
	
	var mideventdiv = eventdiv.appendChild(document.createElement("TD"));
	mideventdiv.setAttribute("class", "onoff-container event");
	var onoffswitch2 = createOnOffSwitch(id+2)
	mideventdiv.appendChild(onoffswitch2);
	
	lefteventdiv.style.cursor = 'pointer';
	lefteventdiv.onclick = function()
	{
		//this.setAttribute("class", "output onmouseclick-eventselect");
		var check = this.children[0];
		if(check.checked == true){check.checked = false;this.parentElement.setAttribute("class", "output");}
		else{check.checked = true;this.parentElement.setAttribute("class", "output onclick-eventselect");}
		
	};
	lefteventdiv.onmouseover = function()
	{
		var check = this.children[0];
		if(check.checked != true) {this.parentElement.setAttribute("class", "output onmouseover-eventselect");}
	}
	lefteventdiv.onmouseout = function()
	{
		var check = this.children[0];
		if(check.checked != true) {this.parentElement.setAttribute("class", "output");}
	};
	/*(function(element) {
		if( element.className == "onoff-container event")
		{
			element.className = "onoff-container event true";
		}
		else if (element.className == "onoff-container event true")
		{
			element.className = "onoff-container event";
		}
	})(eventdiv);
	*/
	/*var eventradioon = document.createElement("input");
	eventradioon.setAttribute("type", "radio");
	eventradioon.checked = true;
	eventradioon.setAttribute("id", id + 4);
	eventradioon.setAttribute("name", id + "radio");
	var on = document.createTextNode("On: ");
	mideventdiv.appendChild(on);
	mideventdiv.appendChild(eventradioon);
	*/
	/*var righteventdiv = eventdiv.appendChild(document.createElement("DIV"));
	righteventdiv.setAttribute("class", "pure-u-1-3 right-div");
	var eventradiooff = document.createElement("input");
	eventradiooff.setAttribute("type", "radio");
	eventradiooff.setAttribute("id", id + 3);
	eventradiooff.setAttribute("name", id + "radio");
	var off = document.createTextNode("Off: ");
	righteventdiv.appendChild(off);
	righteventdiv.appendChild(eventradiooff);
	*/
}
function createOnOffSwitch(id, onclickFunction)
{
		var onoffswitch = document.createElement("DIV");
		onoffswitch.setAttribute("class", "onoffswitch");
	var onoffswitchinput = document.createElement("input");
		onoffswitchinput.setAttribute("type", "checkbox");
		onoffswitchinput.setAttribute("name", "onoffswitch");
		onoffswitchinput.setAttribute("class", "onoffswitch-checkbox");
		onoffswitchinput.setAttribute("id", id);
		if (onclickFunction !== undefined){ onoffswitchinput.setAttribute("onclick", onclickFunction); }//only set onclick attribute of a function is passed
	onoffswitch.appendChild(onoffswitchinput);
	var onoffswitchlabel = document.createElement("label");
		onoffswitchlabel.setAttribute("class", "onoffswitch-label");
		onoffswitchlabel.setAttribute("for", id);
	onoffswitch.appendChild(onoffswitchlabel);
	var onoffswitchspani = document.createElement("span");
		onoffswitchspani.setAttribute("class", "onoffswitch-inner");
	onoffswitchlabel.appendChild(onoffswitchspani);
	var onoffswitchspans = document.createElement("span");
		onoffswitchspans.setAttribute("class", "onoffswitch-switch");
	onoffswitchlabel.appendChild(onoffswitchspans);
	return(onoffswitch);
}
function setOutput(id, state){
	var ids = id;//the ones place corresponds to the operation to be performed (all id's have been multiplied by 10)
	if(state == true) ids++;//if the checkbox has been checked, set the ones place equal to 1, indicating that the on operation
	socket.emit('setOutput', ids);
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
		if(data.val == 0)	{ status.nodeValue = device.lowmsg;}
		else if(data.val == 1)	{ status.nodeValue = device.highmsg;}//reflect current state of pin on GUI
		d2.setAttribute("id", id);
		d2.appendChild(status);
		div.appendChild(d2);
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