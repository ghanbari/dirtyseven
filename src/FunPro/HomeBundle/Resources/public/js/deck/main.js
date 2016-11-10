function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

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

var socket = WS.connect('ws://dirtyseven.ir:8080');
var session;

socket.on('socket/connect', function(sess) {
    session = sess;
    $('a[href*=create_game]').removeClass('disabled');
    messenger.notification({'message': 'Successfully Connected', 'from': 'Bot'});
    changeStatus('connected');

    session.subscribe('chat/public', function(uri, payload) {
        if (payload.constructor.toString().indexOf("Array") > -1) {
            $.each(payload, function (index, value) {
                messenger.notification(value);
            });
        }

        switch (payload.type) {
            case 'notification':
                messenger.notification(payload);
                break;
            case 'game_invitation':
                //messenger.gameInvitation(payload);
                break;
            case 'friend_invitation':
                $(document).triggerHandler('friend_invitation', payload);
                break;
            case 'remove_friend':
                $(document).triggerHandler('remove_friend', payload);
                break;
            case 'answer_to_friend_invitation':
                $(document).triggerHandler('answer_to_friend_invitation', payload);
                break;
            case 'session':
                deleteAllCookies();
                document.location.reload();
                break;
            case 'friend_status':
                $('.friends-list').trigger('friend_status', payload);
                break;
        }
    });
});

socket.on('socket/disconnect', function (error) {
    messenger.notification({'message': error.reason, 'from': 'Bot'});
    $('a[href*=create_game]').addClass('disabled');
    changeStatus('disconnected');
});