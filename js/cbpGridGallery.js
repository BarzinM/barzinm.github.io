/**
 * cbpGridGallery.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	// var docElem = window.document.documentElement,
	// 	transEndEventNames = {
	// 		'WebkitTransition': 'webkitTransitionEnd',
	// 		'MozTransition': 'transitionend',
	// 		'OTransition': 'oTransitionEnd',
	// 		'msTransition': 'MSTransitionEnd',
	// 		'transition': 'transitionend'
	// 	},
	// 	transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
	// 	support = {
	// 		transitions : Modernizr.csstransitions,
	// 		support3d : Modernizr.csstransforms3d
	// 	};

	// function setTransform( el, transformStr ) {
	// 	el.style.WebkitTransform = transformStr;
	// 	el.style.msTransform = transformStr;
	// 	el.style.transform = transformStr;
	// }

	// from http://responsejs.com/labs/dimensions/
	// function getViewportW() {
	// 	var client = docElem['clientWidth'],
	// 		inner = window['innerWidth'];
		
	// 	if( client < inner )
	// 		return inner;
	// 	else
	// 		return client;
	// }

	// function extend( a, b ) {
	// 	for( var key in b ) { 
	// 		if( b.hasOwnProperty( key ) ) {
	// 			a[key] = b[key];
	// 		}
	// 	}
	// 	return a;
	// }

	function CBPGridGallery( el, options ) {
		this.el = el;
		// this.options = extend( {}, this.options );
  		// extend( this.options, options );
  		this._init();
	}

	// CBPGridGallery.prototype.options = {
	// };

	CBPGridGallery.prototype._init = function() {
		// main grid
		this.grid = this.el.querySelector( 'section.grid-wrap > ul.grid' );
		// main grid items
		// this.gridItems = [].slice.call( this.grid.querySelectorAll( 'li:not(.grid-sizer)' ) );
		// items total
		// this.itemsCount = this.gridItems.length;
		// slideshow grid
		// this.slideshow = this.el.querySelector( 'section.slideshow > ul' );
		// slideshow grid items
		// this.slideshowItems = [].slice.call( this.slideshow.children );
		// index of current slideshow item
		// this.current = -1;
		// slideshow control buttons
		// this.ctrlPrev = this.el.querySelector( 'section.slideshow > nav > span.nav-prev' );
		// this.ctrlNext = this.el.querySelector( 'section.slideshow > nav > span.nav-next' );
		// this.ctrlClose = this.el.querySelector( 'section.slideshow > nav > span.nav-close' );
		// init masonry grid
		this._initMasonry();
		// init events
		// this._initEvents();
	};

	CBPGridGallery.prototype._initMasonry = function() {
		var grid = this.grid;
		imagesLoaded( grid, function() {
			new Masonry( grid, {
				itemSelector: 'li',
				columnWidth: grid.querySelector( '.grid-sizer' )
			});
		});
	};

	window.CBPGridGallery = CBPGridGallery;

})( window );