/* ---- navbar scroll ---- */
$(window).scroll(function() {
    if ($(document).scrollTop() > 50) {
       $('.navbar-default').addClass('navbar-scroll');
    } else {
       $('.navbar-default').removeClass('navbar-scroll');
    }
});

/* ---- nav smooth scroll ---- */
$(function() {
    var smoothScrollValue = 750;
    $('.scroll-link').on('click', function(event){
        event.preventDefault();
        var sectionID = $(this).attr("data-id");
        scrollToID('#' + sectionID, smoothScrollValue);
    });
    $('.scroll-top').on('click', function(event) {
        event.preventDefault();
        $('html, body').animate({scrollTop:0}, 1200);
    });
});

/* ---- navbar offset ---- */
function scrollToID(id, speed){
    var offset = 0;
    var targetOffset = $(id).offset().top - offset;
    $('html,body').animate({scrollTop:targetOffset}, speed);
}

/* ---- gallery ---- */
$('#gallery').magnificPopup({
    delegate: 'a.zoom',
    type: 'image',
    fixedContentPos: false,
    removalDelay: 300,
    mainClass: 'mfp-fade',
    gallery: {
        enabled: true,
        preload: [0,2]
    }
});

/* ---- youtube, vimeo, map popup ---- */
$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
    disableOn: 700,
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,
    fixedContentPos: false
});

/* ---- mobile menu color on click ---- */
$(".navbar-toggle").click(function(){
    $(".navbar-default").addClass("navbar-scroll");
})

/* ---- close mobile nav on click ---- */
$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target) === 'a' && $(e.target).attr('class') !== 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});


/* ---- animations ---- */
if (typeof sr === 'undefined') {
    window.sr = ScrollReveal({
        duration: 1000,
        delay: 50
    });
}

function triggerReveals() {
    sr.reveal('.bottomReveal', {
        origin: 'bottom'
    }).reveal('.leftReveal', {
        origin: 'left'
    }).reveal('.rightReveal', {
        origin: 'right'
    }).reveal('.topReveal', {
        origin: 'top'
    });

    sr.reveal('.rotateBottomReveal', {
        origin: 'bottom',
        rotate: { x: 90 }
    }).reveal('.rotateLeftReveal', {
        origin: 'left',
        rotate: { y: 90 }
    }).reveal('.rotateRightReveal', {
        origin: 'right',
        rotate: { y: 90 }
    }).reveal('.rotateTopReveal', {
        origin: 'top',
        rotate: { x: 90 }
    })

    sr.reveal('.scaleReveal', {
        origin: 'top',
        scale: 0.6
    });
}

$(document).ready(triggerReveals);

/* ---- rotater text ---- */
var current = 1; 
var height = jQuery('.ticker').height();
var numberDivs = jQuery('.ticker').children().length;
var first = jQuery('.ticker h1:nth-child(1)');

setInterval(function() {
    var number = current * -height;
    first.css('margin-top', number + 'px');
    if (current === numberDivs) {
        first.css('margin-top', '0px');
        current = 1;
    } else {
        current++;
    }
}, 2500);

/* ---- slideshow continue ---- */
$('#slideshow').carousel({
    pause: "false"
});