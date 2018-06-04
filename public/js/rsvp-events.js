"use strict";

function validateName() {
    guestName = $("#name").val();
    console.log(guestName);

    $("#reservation-name-messages").text(null);

    return $.get('/api/rsvp', {name: guestName})
        .then(function (data) {
            let message;

            if (!data.hasOwnProperty('reservation_id') || !data.hasOwnProperty('full_name')) {
                message = "There was a problem loading or finding your reservation. Please contact us and we'll help you out!";
                $("#reservation-name-messages").text(message);
            }

            reservationId = data.reservation_id;
            guestName = data.full_name;
            Cookies.set("reservationId", data.reservation_id);
            Cookies.set("rsvpName", data.full_name);

            $("#reservation-name-messages").text("");
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
        throw new Error("Missing reservation id");
    }

    $("#rsvp-failed").hide();

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
    var reservationData = [];

    reservationDetails.forEach(function(detail, index) {
        var guestId = $(".rsvp-data")[index].children[0].attributes["guest-id"].value;

        var attendanceId = $("#attendance-" + guestId)[0].value;
        var foodId = $("#food-" + guestId)[0].value;

        reservationData.push({
            guestId: guestId,
            attendanceId: attendanceId,
            foodId: foodId
        });
    });

    console.log(reservationData);
    return $.ajax('/api/rsvp', {
        method: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({
            data: reservationData
        })
    })
        .done(function(result) {
            $("#rsvp-final").append(result.message);
        })
        .fail(function(err) {
            console.log("Error " + JSON.stringify(err));

        });

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