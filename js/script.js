$(".navbar-brand.page-scroll").hide();
var $window = $(window),
$image = $('.something');
$window.on('scroll', function() {
	var top = $window.scrollTop();

	$image
	.css('transform', 'translate3d(0px, '+top+'px, 0px)')
	.css('opacity', 1-(top/400));
});
$window.trigger('scroll');
