/* CSS3 transition polyfill 
   =========================================== */

$.fn._transition = function (styles, duration, callback) {
    var $element = this;

    // Get properties that need to transition

    var properties = [];
    for (var prop in styles) {
        properties.push(prop);
    }
    var transitionProps = properties.join(', ');

    // Use css transitions if supported
    // otherwise use jQuery

    if (typeof(Modernizr) != 'undefined' && Modernizr.csstransitions) {

        var transitionStyles = {
            'transition-property': transitionProps, // eg. 'width, left, color'
            'transition-duration': duration + 'ms',
            'transition-timing-function': 'ease'
        };
        $element.css($.extend({}, styles, transitionStyles));

        setTimeout(function () {
            $element.css({ 'transition': 'none' }); // reset transition
            if (callback) { callback(); }
        }, duration);
    }
    else {
        $element.animate(styles, duration, callback);
    }
};


/*
 * SlideNav
 * A jQuery navigation slider that is easily configurable
 * Version: "1.0.0"
 * Florian Bar (http://www.flobar.co.za/)
 * License: MIT
 */

(function ($, window, undefined) {

    var pluginName = "slidenav";

    /* The constructor 
       =========================================== */

    $[pluginName] = function (element, options) {
        var self = this;
        var options = $.extend({}, $[pluginName].defaults, options);

        var $slidenav = $(element);
        var elementId = '#' + $(element).attr('id');
        var $wrap = $('.slidenav-wrap', $slidenav);

        var $rightTriggers = $('a[href="' + elementId + '"][data-slidenav-menu="right"]');
        var $leftTriggers = $('a[href="' + elementId + '"][data-slidenav-menu="left"]');

        init();

        /* User events
           =========================================== */

        $('body').on('click.' + pluginName, 'a[href="' + elementId + '"]', function (e) {
                var direction = $(this).attr('data-slidenav-menu') || 'right';

                switch (direction) {

                    case 'right':

                        if ($slidenav.hasClass("right-is-open")) {
                            self.closeMenu();
                        } else {
                            self.openRightMenu();
                        }

                        break;

                    case 'left':

                        if ($slidenav.hasClass("left-is-open")) {
                            self.closeMenu();
                        } else {
                            self.openLeftMenu();
                        }

                        break;
                }

                e.preventDefault();
            });

        $slidenav
            .on('click.' + pluginName, 'li a', function (e) {
                var $link = $(this);
                var $parentLi = $link.parent();

                if ($('ul', $parentLi).length) {

                    var $menu = $link.closest('[class^="slidenav-menu-"]');
                    var tierHtml = $link.closest('li').html();

                    nextTier($menu, tierHtml);
                    e.preventDefault();
                }
            })
            .on('click.' + pluginName, '.slidenav-back', function (e) {
                var $menu = $(this).closest('[class^="slidenav-menu-"]');
                prevTier($menu);
                e.preventDefault();
            });

        $(document).on('click.' + pluginName, function (e) {
            var $target = $(e.target);

            if (options.closeOnFocusOut) {
                // Close the menu if:
                // - user clicked inside the slidenav
                // - and not inside the right or left menu
                // - and not on a trigger
                if (
                    $target.closest($slidenav).length
                    && !$target.closest('[class^="slidenav-menu-"]').length
                    && !$target.closest('a[href="' + elementId + '"]').length
                ){
                    self.closeMenu();
                }
            }
        });

        /* Public scope
           =========================================== */

        self.closeMenu = function () {

            $wrap.stop()._transition({ 'left': '0px' }, options.duration, function () {
                // $body.removeClass("slidenav-open");
                $slidenav.removeClass("right-is-open");
                $slidenav.removeClass("left-is-open");

                if (options.onCloseEnd) { options.onCloseEnd(); }
                $slidenav.trigger("onCloseEnd");
            });

            // Events
            if (options.onClose) { options.onClose(); }
            $slidenav.trigger("onClose");

            // Remove active class from triggers
            $rightTriggers.removeClass('is-active');
            $leftTriggers.removeClass('is-active');
        };

        self.openRightMenu = function () {

            $wrap.stop()._transition({ 'left': '-250px' }, options.duration, function () {
                if (options.onOpenEnd) { options.onOpenEnd(); }
                $slidenav.trigger('onOpenEnd');
            });

            // $body.addClass("slidenav-open");
            $slidenav.removeClass("left-is-open"); // remove class incase left menu was open
            $slidenav.addClass("right-is-open");

            // Events
            if (options.onOpen) { options.onOpen(); }
            $slidenav.trigger("onOpen");

            // Add active class to triggers
            $leftTriggers.removeClass('is-active');
            $rightTriggers.addClass('is-active');
        };

        self.openLeftMenu = function () {

            $wrap.stop()._transition({ 'left': '250px' }, options.duration, function () {
                if (options.onOpenEnd) { options.onOpenEnd(); }
                $slidenav.trigger("onOpenEnd");
            });

            // $body.addClass("slidenav-open");
            $slidenav.removeClass("right-is-open"); // remove class incase right menu was open
            $slidenav.addClass("left-is-open");

            // Events
            if (options.onOpen) { options.onOpen(); }
            $slidenav.trigger("onOpen");

            // Add active class to triggers
            $rightTriggers.removeClass('is-active');
            $leftTriggers.addClass('is-active');
        };

        /* Private scope
           =========================================== */

        function init() {
            prepareHtml();
        }

        function prepareHtml() {
            $('[class^="slidenav-menu-"]', $slidenav).wrapInner('<div class="slidenav-tierwrap"><div class="slidenav-tier" /></div>');

            $('[class^="slidenav-menu-"] li', $slidenav).each(function (index, elemenet) {
                var $elemenet = $(elemenet);

                if ($('> ul', $elemenet).length) {
                    $('> a', $elemenet)
                        .addClass('slidenav-tierlink');
                        //.append('<span class="icon-arrow-1-right" />');
                }
            });
        }

        function nextTier($menu, html) {
            var $tierWrap = $('.slidenav-tierwrap', $menu);
            var tierCount = $('.slidenav-tier', $tierWrap).length;

            tierCount++;

            // Create the new tier and slide to it
            $tierWrap
                .width(250 * tierCount)
                .append('<div class="slidenav-tier">' + html + '<a class="slidenav-back" href="#">< Back</a></div>');

            var leftPos = -250 * (tierCount - 1);
            $tierWrap.stop()._transition({ left: leftPos + 'px' }, options.duration);
        }

        function prevTier($menu) {
            var $tierWrap = $('.slidenav-tierwrap', $menu);
            var tierIndex = $('.slidenav-tier', $tierWrap).length - 2;

            var tierCount = $('.slidenav-tier', $tierWrap).length;

            $tierWrap.stop()._transition({ left: -250 * tierIndex + 'px' }, options.duration, function () {
                $('.slidenav-tier', $tierWrap).eq(tierIndex + 1).remove();

                var tierCount = $('.slidenav-tier', $tierWrap).length;
                $tierWrap.width(250 * tierCount);
            });
        }
    };

    /* Default options
       =========================================== */

    $[pluginName].defaults = {
        duration: 400,
        closeOnFocusOut: true,

        onOpen: null,
        onOpenEnd: null,
        onClose: null,
        onCloseEnd: null
    };

    /* The plugin
       =========================================== */

    $.fn[pluginName] = function (options) {
        return this.each(function (index, element) {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new $[pluginName](element, options));
            }
        });
    };

})(jQuery, window);