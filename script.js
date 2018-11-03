$(document).ready(function () {
    $(".project_link").click(function () {
    	// $(this).parent().parent().next().toggleClass("hidden unhidden");
    	$(this).parent().parent().next().toggleClass("hide show");
    });
});