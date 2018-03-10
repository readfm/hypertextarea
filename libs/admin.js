window.Admin = {

}

$(function(){
	$('#intro').removeAttr('readonly').change(function(){
		ws.send({
			cmd: 'updateProfile',
			set: {
				intro: this.value
			}
		});
	});
});