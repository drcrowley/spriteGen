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
			allowedFileTypes: ["image"],
		});

		$("form").validate({
			errorClass: "alert alert-danger",
			rules: {
				title: {remote: {url: "./api/checktitle", type : "post"}},
			}	
		});	
		jQuery.extend(jQuery.validator.messages, {
		    required: "Поле не заполнено или заполнено не верно",
		    remote: "Такое имя уже существует.",
		});			
	});

	$(window).load(function () {

	});

})();



