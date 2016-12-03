document.addEventListener('DOMContentLoaded', function () {
    if (!Notification) {
        if (Notification.permission !== "granted")
            Notification.requestPermission();
    }
});

$(document).ready(function () {
    $('#messages-archive').niceScroll();
});

var messenger = {
    notification: function (payload, playSound) {
        that = this;
        $('#messeges > :not(.messenger-notification)').remove();
        $("#messeges").loadTemplate(
            $("#messenger-notification"),
            {
                author: payload.from,
                message: emojione.shortnameToImage(payload.message)
            },
            {
                prepend: true,
                success: function () {
                    $('#messeges > .messenger-notification:nth-of-type(3)').remove();
                    if (playSound === undefined || playSound === true) {
                        that.playSound();
                    }
                }
            }
        );

        $("#messages-archive").loadTemplate(
            $("#messenger-notification"),
            {
                author: payload.from,
                message: emojione.shortnameToImage(payload.message)
            },
            { prepend: true }
        );
    },
    playSound: function () {
        var audio = new Audio('/sounds/telegram.mp3');
        audio.play();
    }
};

$('button.show-messages-archive').click(function (event) {
    $('div#messages-archive').slideToggle();
    $('.messenger .plus').toggleClass('opened');
    $('.messenger .plus').text() == '+' ? $('.messenger .plus').text('x') : $('.messenger .plus').text('+');
});