function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

//function changeMyStatus(status) {
//    $('#my-status')
//        .removeClass('online offline inviting invited playing')
//        .addClass(status);
//}

var socket = WS.connect('ws://' + soho + ':' + sopo);
var session;

socket.on('socket/connect', function(sess) {
    session = sess;
    //TODO: move this line to check game rpc
    $('a.game').removeClass('disabled');
    messenger.notification({'message': 'Successfully Connected', 'from': 'Bot'});
    userStatus.update($.jStorage.get('myUsername'), 'online');

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
                $(document).triggerHandler('game_invitation', payload);
                break;
            case 'answer_to_game_invitation':
                $(document).triggerHandler('answer_to_game_invitation', payload);
                break;
            case 'game_status':
                $('#current-game').trigger('game_status', payload);
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
    $('a.game').addClass('disabled');
    userStatus.update($.jStorage.get('myUsername'), 'offline');
});