(function ($) {
    "use strict";

    
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


 


  



    // Enable dropdown on hover for desktop
    $('nav .dropdown').hover(
        function () {
          if (window.innerWidth >= 992) {
            $(this).addClass('show');
            $(this).find('.dropdown-toggle').attr('aria-expanded', 'true');
            $(this).find('.dropdown-menu').addClass('show');
          }
        },
        function () {
          if (window.innerWidth >= 992) {
            $(this).removeClass('show');
            $(this).find('.dropdown-toggle').attr('aria-expanded', 'false');
            $(this).find('.dropdown-menu').removeClass('show');
          }
        }
      );

    
})(jQuery);

