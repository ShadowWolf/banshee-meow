"use strict";

function validateName() {
    guestName = $("#name").val();
    console.log(guestName);

    $("#reservation-name-messages").text(null);

    return $.get('/api/rsvp', {name: guestName})
        .then(function (data) {
            let message;

            if (data.hasOwnProperty('reservation_id')) {
                reservationId = data.reservation_id;
                Cookies.set("rsvpName", guestName);
                Cookies.set("reservationId", reservationId);
            } else {
                message = "There was a problem loading or finding your reservation. Please contact us and we'll help you out!";
            }

            $("#reservation-name-messages").text(message);
        }, function(fail) {
            console.log(fail.status);
            if (fail.status === 404) {
                $("#reservation-name-messages").text("There was a problem loading or finding your reservation. Please contact us and we'll help you out!");
            } else if (fail.status === 401) {
                $("#reservation-name-messages").text("Please use your full first and last name");
            }
        });
}

function findRsvpDetails() {
    if (!reservationId) {
        $("#rsvp-failed").show();
        throw "Missing reservation id";
    }

    console.log(`loading reservation ${reservationId}`);

    var resPromise = $.get(`/api/rsvp/${reservationId}`)
        .then(function(result) {
            console.log(result);
            reservationDetails = result;
        });

    var foodPromise = $.get('/api/food');

    $.when(resPromise, foodPromise)
        .then(function(allDone) {
            console.log("ALL DONE");
        });
}

function submitForm() {
    $.post("api/rsvp", {
        data: {

        }
    });

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