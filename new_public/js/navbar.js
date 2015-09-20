var show_camera_page = true;

//draw device switches
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
		
		$('#input_div')[0].innerHTML = $('#input_div')[0].innerHTML + '<div style="margin:20px" ><input id="' + id + '"  type="checkbox" ' + checked + '><p>' + name + '</p></div>'
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
		
		$('#output_div')[0].innerHTML = $('#output_div')[0].innerHTML + '<a id="' + id + '" href="#" style="width: 25%; text-align: center;" class="list-group-item ' + className + '">' + checked + '</a><br/>'
	}}

function switchPage(page_from, page_to) {
	$('#' + page_from).css('display','none');
	$('#' + page_to).css('display','block');
	if(show_camera_page) {
		$('.camera_li').css('display','block');
	} else {
		$('.camera_li').css('display','none');
	}
}

function addToTbl(tbl_id, column_vals) {
	var row_str = "<tr>";
	
	for(var i = 0; i < column_vals.length; i++) {
		row_str += "<td>" + column_vals[i] + "</td>"
	}
	
	row_str += "<td class='deleterow' onclick='deleterow_onclick(this)'><div class='glyphicon glyphicon-remove'></div></td></tr>";
	
	var row = $(row_str);
    $("#" + tbl_id + " > tbody").append(row);
}

$(".deleterow").on("click", function(){
var $killrow = $(this).parent('tr');
    $killrow.addClass("danger");
$killrow.fadeOut(200, function(){
    $(this).remove();
});});

function deleterow_onclick(e) {
	var $killrow = $(e).parent('tr');
    $killrow.addClass("danger");
	$killrow.fadeOut(200, function(){
		$(e).remove();
	});
}

function active_item(active_id, list_class) {
	for(var i = 0; i < $('.' + list_class).length; i++) {
		$('.' + list_class)[i].className = list_class + ' list-group-item';
	}
	$('#' + active_id)[0].className = list_class + ' list-group-item active';
}

function show_time_gui() {
	$(".gpio_list").css('display','none');
	$(".time_list").css('display','block');
}

function show_gpio_gui() {
	$(".gpio_list").css('display','block');
	$(".time_list").css('display','none');
}