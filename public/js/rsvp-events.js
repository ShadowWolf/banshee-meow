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
            if (fail.status === 401) {
                $("#reservation-name-messages").text("Please use your full first and last name");
            } else {
                $("#reservation-name-messages").text("There was a problem loading or finding your reservation. Please contact us and we'll help you out!");
            }
        });
}

function hideRsvpLoader() {
    $("#rsvp-loading-screen").hide();
}

function findRsvpDetails() {
    if (!reservationId) {
        hideRsvpLoader();
        $("#rsvp-failed").show();
        throw "Missing reservation id";
    }

    console.log(`loading reservation ${reservationId}`);

    var resPromise;

    if (reservationDetails && reservationDetails[0].reservation_id === reservationId) {
        resPromise = $.when(reservationDetails);
    } else {
        $(".rsvp-data").remove();
        resPromise = $.get(`/api/rsvp/${reservationId}`)
            .then(function(result) {
                console.log(result);
                reservationDetails = result;
                return result;
            })
            .then(function(test) {
                console.log(test);
                hideRsvpLoader();
                $.each(reservationDetails, function (_, result) {
                    $("#rsvp-reservation-details").append("<div class='rsvp-data'>" + result.detail_html + "</div>");
                    $(".rsvp-selection-attending").addClass()
                });
                $("#rsvp-reservation-details").show();
                wireBootstrapEvents();
            });
    }

    return resPromise;
}

function wireBootstrapEvents() {
    // $(".rsvp-selection-attending").change(function() {
    //     //     if (this.options[this.selectedIndex].text === "Regrets") {
    //     //         $("").prop("disabled", true);
    //     //     }
    //     // });
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