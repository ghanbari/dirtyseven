var connection_status = 'disconnected';
var session;

var socket = WS.connect('ws://dirtyseven.ir:8080');

socket.on('socket/connect', function(sess) {
    session = sess;
    connection_status = 'connected';

    $('a[href*=create_game]').removeClass('disabled');
    messenger.notification({'message': 'Successfully Connected', 'from': 'Bot'});
    changeStatus('connected');

    session.subscribe('chat/public', function(uri, payload) {
        if (typeof payload != 'object') {
            return;
        }

        switch (payload.type) {
            case 'notification':
                messenger.notification(payload);
                break;
            case 'game_invitation':
                messenger.gameInvitation(payload);
                break;
            case 'friend_request':
                messenger.friendRequest(payload);
                break;
        }
    });
});

socket.on('socket/disconnect', function (error) {
    connection_status = 'disconnected';
    messenger.notification({'message': error.reason, 'from': 'Bot'});
    $('a[href*=create_game]').addClass('disabled');
    changeStatus('disconnected');
});

$(document).on('games/resume', function (event, data) {
    changeStatus(data.gameStatus);
});

function changeStatus(status) {
    if (status == 'waiting') {
        $('.user-status').css('color', 'yellow');
        $('.user-status').parent().attr('title', 'Creating game');
    } else if (status == 'playing') {
        $('.user-status').css('color', 'red');
        $('.user-status').parent().attr('title', 'Playing');
    } else if (status == 'disconnected') {
        $('.user-status').css('color', 'grey');
        $('.user-status').parent().attr('title', 'Disconnected');
    } else {
        $('.user-status').css('color', 'green');
        $('.user-status').parent().attr('title', 'Online & Free');
    }
}