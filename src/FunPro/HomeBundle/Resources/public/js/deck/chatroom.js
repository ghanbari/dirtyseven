function getOpenedChatRoom(username) {
    if ($('.chat-rooms > .chat-room[data-username=' + username + ']').length) {
        return $('.chat-rooms > .chat-room[data-username=' + username + ']');
    }
}

function openChatRoom(username, status) {
    if (getOpenedChatRoom(username)) {
        return;
    }

    var data = {
        username: username,
        chat_room_id: 'chat-room-' + username,
        link_to_chat_room: '#chat-room-' + username,
        link_to_chat_content: '#chat-content-' + username,
        chat_content_id: 'chat-content-' + username
    };

    if (status !== undefined) {
        data.user_status = status;
    }

    $('.chat-rooms').loadTemplate($('#chat-room'), data, {append: true});
    $('#chat-content-' + username + ' .card-block').niceScroll();
    $('#chat-content-' + username).collapse('toggle');

    loadLastMessage(username, 1);
}

function loadLastMessage(friend, page) {
    var w;
    if (typeof(Worker) !== "undefined") {
        if (typeof(w) == "undefined") {
            w = new Worker("/bundles/funprohome/js/deck/worker/load_chat_archive.js");
            w.postMessage({
                myUsername: $.jStorage.get('myUsername'),
                myFriend: friend,
                template_send: $('#message-send-worker').html(),
                template_receive: $('#message-receive-worker').html(),
                page: page
            });
        }
        w.onmessage = function (e) {
            $('#chat-content-' + friend + ' .card-block').html(e.data);
            $('#chat-content-' + friend + ' .card-block').animate({scrollTop: $('#chat-content-' + friend + ' .message').last().position().top});
        };
    } else {
        session.call('user/get_chat_message', {username: friend, page: page}).then(
            function (result) {
                $.each(result.data.messages, function (index, message) {
                    showMessage(friend, PHPUnserialize.unserialize(message), 'prepend');
                });
                $('#chat-content-' + friend + ' .card-block').animate({scrollTop: $('#chat-content-' + friend + ' .message').last().position().top});
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    }
}

function sendMessage(event) {
    event.preventDefault();
    var root_node = $(this).closest('.chat-room');
    var username = $(root_node).data('username');
    var textbox = $(this).closest('.chat-room-messenger').find('.chat-room-message');
    var message = $(textbox).val();
    var now = new Date();
    $(textbox).val('');

    session.publish('chatroom/' + username, message);
    showMessage(username, {from: $.jStorage.get('myUsername'), message: message, time: now.getTime()/1000});
}

function showMessage(friend, payload, attachType) {
    attachType = attachType === undefined ? 'append' : attachType;
    var options = attachType === 'append' ? {append: true} : {prepend: true};
    var template = payload.from === $.jStorage.get('myUsername') ? $('#message-send') : $('#message-receive');
    var message = '<p>' + payload.message + '</p>';
    var time = new Date(payload.time*1000);

    if ((($('#chat-content-' + friend + ' .message:last-child').is('.message-send') && payload.from == $.jStorage.get('myUsername'))
        || ($('#chat-content-' + friend + ' .message:last-child').is('.message-receive') && payload.from == friend)
        ) && (new Date($('#chat-content-' + friend + ' .message:last-child').data('time'))).getMinutes() == (new Date()).getMinutes()
    ) {
        $('#chat-content-' + friend + ' .message:last-child').find('.message-text p:last-child')
            [attachType]('<br>' + payload.message);
    } else {
        $('#chat-content-' + friend + ' .card-block').loadTemplate(
            template,
            {
                username: payload.from,
                message: message,
                timestamp: time,
                time: time.getHours() + ':' + time.getMinutes()
            },
            options
        );
    }
}

socket.on('socket/connect', function (session)  {
    session.subscribe('chatroom/' + $.jStorage.get('myUsername'), function (uri, payload) {
        openChatRoom(payload.from);
        showMessage(payload.from, payload);
    });
});

//when user click on message button in friend list
$('.friends-list').on('click', '.open-chat-room', function (event) {
    event.preventDefault();
    var root_node = $(this).closest('.friend-list-item');
    var username = $(root_node).data('username');
    var user_status = $(root_node).find('.status').data('status');

    if ($(getOpenedChatRoom(username)).length) {
        $(getOpenedChatRoom(username)).collapse('toggle');
        return;
    } else {
        $('#friends-list').modal('toggle');
        openChatRoom(username, user_status);
    }
});

$('.chat-rooms').on('click', '.min-max', function (event) {
    $(this)
        .toggleClass('fa-minus')
        .toggleClass('fa-plus');
});

$('.chat-rooms').on('click', '.send-message', sendMessage);
$('.chat-rooms').on('submit', '.chat-room-messenger', sendMessage);