"use strict";
var current_page;
var next_page;
var previous_page;
var left;
var opacity;
var scale;
var animating;

$(".rsvp-next").click(function() {
    if (animating) return false;
    animating = true;

    current_page = $(this).parent();
    next_page = $(this).parent().next();

    $("#rsvp-progress-bar li").eq($("fieldset").index(current_page)).addClass("active")

    next_page.show();
    current_page.animate({height: "toggle"}, {
        // step: function(now, mx) {
        //     // Slide next_page from the right
        //     left = (now * 50) + "%";
        //     opacity = 1 - now;
        //     next_page.css({
        //         'left': left,
        //         'opacity': opacity
        //     })
        // },
        duration: 800,
        complete: function () {
            current_page.hide();
            animating = false;
        },
        easing: 'easeInSine'
    })
});

$(".rsvp-previous").click(function() {
    if (animating) return false;
    animating = true;

    current_page = $(this).parent();
    previous_page = $(this).parent().prev();

    $("#rsvp-progress-bar li").eq($("fieldset").index(previous_page)).removeClass("active");

    previous_page.show();
    current_page.animate({height: "toggle"}, {
        // step: function (now, mx) {
        //     left = ((1 - now) + 50) + "%";
        //     opacity = 1 - now;
        //     current_page.css({
        //         'left': left
        //     });
        //     previous_page.css({
        //         'opacity': opacity
        //     });
        // },
        duration: 800,
        complete: function () {
            current_page.hide();
            animating = false;
        },
        easing: 'easeInSine'
    })
});

$(".rsvp-submit").click(function() {
    if (animating) return false;
    animating = true;

    current_page = $(this).parent();

    $("#rsvp-progress-bar li").eq($("fieldset").index(current_page)).addClass("active")
    alert("AAAANNNNDD We're done here");

});

function submitForm() {
    $.ajax({
        type: 'POST',
        url: 'api/rsvp',

    })
    // Initiate Variables With Form Content

    //alert('El Wompo');
    // $.ajax({
    //     type: "POST",
    //     url: "php/contact.php",
    //     data: "name=" + name + "&email=" + email + "&msg_subject=" +
    //         msg_subject + "&message=" + message,
    //     success: function(text) {
    //         if (text == "success") {
    //             formSuccess();
    //         } else {
    //             formError();
    //             submitMSG(false, text);
    //         }
    //     }
    // });
}