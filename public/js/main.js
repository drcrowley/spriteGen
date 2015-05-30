//init
(function () {


	$(document).ready(function () {

		$('.e-tab a').click(function (e) {
			e.preventDefault()
			$(this).tab('show')
		});

		$('.e-file').fileinput({
			maxFileCount: 30,
			language: "ru",
			allowedFileTypes: ["image"]
		});

		$("form").validate({
			errorClass: "alert alert-danger"	
		});	
		jQuery.extend(jQuery.validator.messages, {
		    required: "Поле не заполнено или заполнено не верно",
		});			
	});

	$(window).load(function () {

	});

})();



