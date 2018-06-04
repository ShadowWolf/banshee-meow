"use strict";
var currentPage;
var nextPage;
var previousPage;
var lastPage;
var firstPage;
var left;
var animating;
var guestName;
var reservationId;
var reservationDetails;

$(document).ready(function() {
});

$("#rsvp-modal").on('show.bs.modal', function(e) {
    // Turn off the carousel when we show the modal
    $("#slider").carousel('pause');

    lastPage = $(".rsvp-last-page");
    firstPage = $(".rsvp-first-page");

    if (currentPage) {
        currentPage.hide();
    }

    previousPage = null;
    currentPage = firstPage;
    nextPage = currentPage.next();

    guestName = Cookies.get("rsvpName");
    if (guestName) {
        console.log("Saved guest: " + guestName);
        $("#name").val(guestName);
    }

    reservationId = Cookies.get("reservationId");

    currentPage.fadeIn({
        duration: 400,
        easing: 'easeInSine'
    });
    setNavbarPage();
});

$("#rsvp-modal").on('hide.bs.modal', function(e) {
    $("#slider").carousel('cycle');
});

function setNavbarPage() {
    $("#rsvp-progress-bar li").removeClass("active");
    $("#rsvp-progress-bar li").eq($("fieldset").index(currentPage)).addClass("active");
    if (currentPage.is(firstPage)) {
        $("input:button.rsvp-previous").hide();
        $("input:submit.rsvp-submit").hide();
        $("input:button.rsvp-next").show();
    } else if (currentPage.is(lastPage)) {
        $("input:button.rsvp-previous").show();
        $("input:button.rsvp-next").hide();
        $("input:submit.rsvp-submit").show();
    } else {
        $("input:button.rsvp-previous").show();
        $("input:button.rsvp-next").show();
        $("input:submit.rsvp-submit").hide();
    }
}

function runFunction(selector, attributeName, self) {
    if (hasFunction(selector, attributeName)) {
        var func = selector.attr(attributeName);
        return window[func].bind(self)();
    } else {
        return $.when();
    }
}

function hasFunction(selector, attributeName) {
    var func = selector.attr(attributeName);
    return func &&
        window[func] &&
        typeof(window[func]) === "function";
}

$(".rsvp-next").click(function() {
    if (animating) return false;
    animating = true;

    var promise;

    if (hasFunction(currentPage, "onValidate")) {
        promise = runFunction(currentPage, "onValidate", this);
    } else if (hasFunction(currentPage, "onNext")) {
        promise = runFunction(currentPage, "onNext", this);
    } else {
        promise = $.when();
    }

    promise
        .then(function () {
                currentPage.fadeOut(400,
                    function () {
                        nextPage.fadeIn({
                            duration: 400,
                            easing: 'easeInSine',
                            complete: function () {
                                previousPage = currentPage;
                                currentPage = nextPage;
                                nextPage = currentPage.next();
                                setNavbarPage();
                                runFunction(currentPage, "onActivate", this);
                                animating = false;
                            }
                        });
                    });
        },
        function() {
            animating = false;
        });
});

$(".rsvp-previous").click(function() {
    if (animating) return false;
    animating = true;

    currentPage.fadeOut(400,
        function() {
            previousPage.fadeIn({
                duration: 400,
                easing: 'easeInSine',
                complete: function() {
                    nextPage = currentPage;
                    currentPage = previousPage;
                    previousPage = previousPage.prev();
                    setNavbarPage();
                    animating = false;
                }
            })
        });
});

$(".rsvp-submit").click(function() {
    if (animating) return false;
    animating = true;

    submitForm();
});


$("#rsvp-form").bind('keypress', function(e) {
    if (e.keyCode === 13 ) {
        $(".rsvp-next").click();
        return false;
    }
});

/* ---- contact form ---- */


function formSuccess() {
    $("#rsvp-form")[0].reset();
    submitMSG(true, "Message Submitted!");
}

function formError() {
    $("#rsvp-form").removeClass().addClass('shake animated').one(
        'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function() {
            $(this).removeClass();
        });
}

function submitMSG(valid, msg) {
    var msgClasses = valid ? "h4 text-success" : "h4 text-danger";

    $("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
}
