$(".navbar-brand.page-scroll").hide();
var $window = $(window),
$image = $('.something');
$window.on('scroll', function() {
	var top = $window.scrollTop();

	if (top < 0 || top > 1500) { return; }
	$image
	.css('transform', 'translate3d(0px, '+top/2+'px, 0px)')
	.css('opacity', 1-Math.max(top/700, 0));
	var $color=255-parseInt(top/2);

});
$window.trigger('scroll');
