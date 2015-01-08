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
;
(function(window) {
    'use strict';

    function CBPGridGallery(el, options) {
        this.el = el;
        this._init();
    }
    CBPGridGallery.prototype._init = function() {
        this.grid = this.el.querySelector('section.grid-wrap > ul.grid');
        this._initMasonry();
    };
    CBPGridGallery.prototype._initMasonry = function() {
        var grid = this.grid;
        imagesLoaded(grid, function() {
            new Masonry(grid, {
                itemSelector: 'li',
                columnWidth: grid.querySelector('.grid-sizer')
            });
        });
    };
    window.CBPGridGallery = CBPGridGallery;
})(window);
