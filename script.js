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

    	$(next).toggleClass("hide show");
    });
});