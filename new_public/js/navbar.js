var show_camera_page = true;

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