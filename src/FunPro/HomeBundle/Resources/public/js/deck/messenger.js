document.addEventListener('DOMContentLoaded', function () {
    if (!Notification) {
        if (Notification.permission !== "granted")
            Notification.requestPermission();
    }
});

var messenger = {
    messages: [],
    invitations: [],
    sync: function() {
        if (this.invitations.length == 0) {
            for (var i = 0; i < 2 && i < this.messages.length; i++) {
                $("#messeges").loadTemplate(
                    $("#message"),
                    {
                        author: this.messages[i].from,
                        message: this.messages[i].message
                    },
                    { prepend: true, elemPerPage: 20 }
                );
            }
        } else {
            $('#messeges p').remove();
        }

        while ($('#messeges p').length > 2) {
            $('#messeges p:last-of-type').remove();
        }

        var message;
        while (message = this.messages.shift()) {
            $("#messages-archive").loadTemplate(
                $("#message"),
                {
                    author: message.from,
                    message: message.message
                },
                { prepend: true, elemPerPage: 200 }
            );
        }
    },
    write: function (payload) {
        if (typeof payload == 'string') {
            this.messages.push({'type': 'sys', 'from': 'Bot', 'message': payload});
            this.sync();
            return;
        }

        if (payload.constructor.toString().indexOf("Array") > -1) {
            $.each(payload, function (index, item) {
                messenger.write(item);
            });
            return;
        }

        if (typeof payload !== 'object' || typeof payload.type === 'undefined') {
            return;
        }

        switch (payload.type) {
            case 'chat':
                break;
            case 'notify':
                if (payload.from !== undefined && payload.from.toLowerCase() !== 'bot') {
                    new Notification(payload.from, {
                        icon: '/web/images/icon.png',
                        body: payload.message
                    });
                }
                this.messages.push(payload);
                break;
            case 'resume':
                $(document).triggerHandler('games/resume', payload);
                break;
            case 'invite_to_game':
                var now = new Date();
                if (payload.sendAt < (now.getTime() / 1000 - 3600)) {
                    return;
                }

                new Notification(payload.from, {
                    icon: '/web/images/icon.png',
                    body: payload.from + ' invite from you to play ' + payload.gameType
                });

                this.invitations.push(payload);
                $("#messeges").loadTemplate(
                    $("#game_invitation"),
                    {
                        gameId: payload.gameId,
                        from: payload.from,
                        gameType: payload.gameType
                    }
                );
                break;
        }

        this.sync();
    },
    removeInvitation: function (gameId) {
        $.each(this.invitations, function (index, item) {
            console.log(item);
        })
    }
};

$('#messeges').on('click', '.game_invitation > button', function(event) {
    var result = $(this).hasClass('btn-success') ? true : false;
    var gameId = $(this).parent().attr('id');

    session.call('user/answer_to_game_invite', {'answer': result, 'gameId': gameId}).then(
        function(result) {
            if (result.status.code == 1) {
                messenger.removeInvitation(gameId);
                changeStatus('waiting');
            }
            messenger.write(result.status.message);
        }, function(error, desc) {
            messenger.write(error);
        }
    );
});

$('button.show-messages-archive').click(function (event) {
    $('div#messages-archive').slideToggle();
    $('.messenger .plus').toggleClass('opened');
    $('.messenger .plus').text() == '+' ? $('.messenger .plus').text('x') : $('.messenger .plus').text('+');
});