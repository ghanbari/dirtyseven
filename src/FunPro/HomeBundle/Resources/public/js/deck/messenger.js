document.addEventListener('DOMContentLoaded', function () {
    if (!Notification) {
        if (Notification.permission !== "granted")
            Notification.requestPermission();
    }
});

var messenger = {
    gameInvitation: function (payload) {
        var now = new Date();
        if (payload.sendAt < (now.getTime() / 1000 - 3600)) {
            return;
        }

        new Notification(payload.from, {
            icon: '/web/images/icon.png',
            body: payload.from + ' invite from you to play ' + payload.gameType
        });

        $('#messeges *').remove();
        $("#messeges").loadTemplate(
            $("#message-game-invitation"),
            {
                gameId: payload.gameId,
                from: payload.from,
                gameType: payload.gameType
            }
        );
        this.playSound();
    },
    friendRequest: function (payload) {
        new Notification(payload.from, {
            icon: '/web/images/icon.png',
            body: payload.message
        });

        $('#messeges *').remove();
        $("#messeges").loadTemplate(
            $("#message-friend-invitation"),
            {
                from: payload.from,
                message: payload.message
            }
        );
        this.playSound();
    },
    notification: function (payload) {
        that = this;
        $('#messeges > :not(.message-notification)').remove();
        $("#messeges").loadTemplate(
            $("#message-notification"),
            {
                author: payload.from,
                message: payload.message
            },
            {
                prepend: true,
                success: function () {
                    $('#messeges > .message-notification:nth-of-type(3)').remove();
                    that.playSound();
                }
            }
        );

        $("#messages-archive").loadTemplate(
            $("#message-notification"),
            {
                author: payload.from,
                message: payload.message
            },
            { prepend: true }
        );
    },
    playSound: function () {
        var audio = new Audio('/sounds/telegram.mp3');
        audio.play();
    }
};

$('#messeges').on('click', '.message-friend-invitation > button', function(event) {
    var result = $(this).hasClass('btn-success') ? true : false;
    var username = $(this).parent().find('.message>strong').text();

    session.call('user/answer_to_friend_request', {answer: result, username: username}).then(
        function(result) {
            if (result.status.code == 1 && result) {
                //TODO: add to friends list
            }
            messenger.notification({from: 'Bot', message: result.status.message});
        }, function(error, desc) {
            messenger.notification(error);
        }
    );
});

//$('#messeges').on('click', '.game_invitation > button', function(event) {
//    var result = $(this).hasClass('btn-success') ? true : false;
//    var gameId = $(this).parent().attr('id');
//
//    session.call('user/answer_to_game_invite', {'answer': result, 'gameId': gameId}).then(
//        function(result) {
//            if (result.status.code == 1) {
//                messenger.removeInvitation(gameId);
//                changeStatus('waiting');
//            }
//            messenger.write(result.status.message);
//        }, function(error, desc) {
//            messenger.write(error);
//        }
//    );
//});

$('button.show-messages-archive').click(function (event) {
    $('div#messages-archive').slideToggle();
    $('.messenger .plus').toggleClass('opened');
    $('.messenger .plus').text() == '+' ? $('.messenger .plus').text('x') : $('.messenger .plus').text('+');
});