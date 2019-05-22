$(document).ready(function () {
    $(".project_link").click(function () {    	
    	if ($(this).text() == "show")
    	       $(this).text("hide");
    	    else
    	       $(this).text("show");

    	next=$(this).parent().parent().next()

    	$(next).find('img').map(function() {
	    	$(this).attr('src',$(this).data('src'));
    	})

    	$(next).toggleClass("hide");
    });

    $('#form').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            dataType: "jsonp",
            statusCode: {
                0: function() {
                    $('#contact_message').val("");
                    $('#contact_message').attr("placeholder", "Message Sent!");
                },
                200: function() {
                    $('#contact_message').val("");
                    $('#contact_message').attr("placeholder", "Message Sent!");                }
            },
            url: "https://docs.google.com/forms/d/e/1FAIpQLSdOvmaG3ca38EO_u2Z61k2m03tv6cBHWZiRBYe-dK5ZP_w8Dw/formResponse",
            data: {
                'entry.1114812678': $('#contact_message').val()
            }
        });
    })
});