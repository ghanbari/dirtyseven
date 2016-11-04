socket.on('socket/connect', function (session) {
    session.call('friend/friends_and_invitations').then(
        function (result) {
            //load friends list
            $.each(result.data.friends, function (index, friend) {
                addToFriendList(friend);
            });

            //load suggests list
            $.each(result.data.suggests, function (index, suggest) {
                addToSuggestList(suggest);
            });

            //load requests list
            $.each(result.data.requests, function (index, request) {
                addToRequestList(request);
            });
        },
        function(error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
});

function sendAnswerToFriendInvitation(username, answer) {
    session.call('friend/answer_to_friend_request', {answer: answer, username: username}).then(
        function(result) {
            if (result.status.code == 10 && answer) {
                addToFriendList(username);
            }

            removeFromSuggestList(username);
            messenger.notification({from: 'Bot', message: result.status.message});
        }, function(error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
}

function addToFriendList(username) {
    $('.friends-list').loadTemplate(
        $('#friend-list-item'),
        {username: username},
        {prepend: true}
    );
}

function removeFromFriendList(username) {
    $('.friend-list-item[data-username="' + username + '"]').remove();
}

function addToSuggestList(username) {
    $('.friend-suggests').loadTemplate(
        $("#friend-suggest"),
        {username: username},
        {prepend: true}
    );
}

function removeFromSuggestList(username) {
    $('.friend-suggest[data-username="' + username + '"]').remove();
}

function addToRequestList(username) {
    $('.friend-requests').loadTemplate(
        $("#friend-request"),
        {username: username},
        {prepend: true}
    );
}

function removeFromRequestList(username) {
    $('.friend-request[data-username="' + username + '"]').remove();
    $('#count-of-friend-request').text($('#count-of-friend-request').text() - 1);
}

// send a friend invitation
$('form#send-friend-request').submit(function(event) {
    event.preventDefault();
    var username = $('input#friend-username').val();
    $('input#friend-username').val('');

    session.call('friend/send_friend_request_to_username', {'username': username}).then(
        function(result) {
            if (result.status.code == 1) {
                addToRequestList(username);
            } else if (result.status.code == 10) {//users is friends
                removeFromRequestList(username);
                addToFriendList(username);
            }

            messenger.notification({'from': 'Bot', 'message': result.status.message});
            $('#friend-requests').modal('hide');
            $('#count-of-friend-request').text(result.data.count);

            if (result.status.code == -6) {
                messenger.notification({from: 'Bot', message: 'You must remove a user from list.'});
            }
        },
        function(error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
});

//cancel friend invitation
$('.friend-requests').on('click', '.cancel-friend-request', function (event) {
    var root = $(this).closest('.friend-request');
    var username = $(root).data('username');
    session.call('friend/cancel_friend_request', {'username': username}).then(
        function (result) {
            removeFromRequestList(username);
            messenger.notification({'from': 'Bot', 'message': result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
});

//when a friend invitation is received
$(document).on('friend_invitation', function (event, payload) {
    if (payload.status == 'new') {
        //show browser notification
        new Notification(payload.from, {
            icon: '/web/images/icon.png',
            body: payload.message
        });

        //show in messenger
        $('#messeges *').remove();
        $("#messeges").loadTemplate(
            $("#messenger-friend-invitation"),
            {from: payload.from, message: payload.message}
        );
        messenger.playSound();

        //show in suggests
        addToSuggestList(payload.from);
    } else {
        removeFromSuggestList(payload.from);
        messenger.notification(payload);
    }
});

$(document).on('answer_to_friend_invitation', function (event, payload) {
    if (payload.answer == true) {
        addToFriendList(payload.from);
    }

    removeFromRequestList(payload.from);
    messenger.notification({from: payload.from, message: payload.message});
});

$(document).on('remove_friend', function (event, payload) {
    removeFromFriendList(payload.from);
    messenger.notification({from: payload.from, message: payload.message});
});

//answer to friend invitation in messenger
$('#messeges').on('click', '.messenger-friend-invitation > button', function(event) {
    var answer = $(this).hasClass('btn-success') ? true : false;
    var username = $(this).parent().data('username');
    sendAnswerToFriendInvitation(username, answer);
});

//answer to friend invitation
$('.friend-suggests').on('click', '.answer-friend-suggest', function (event) {
    var root = $(this).closest('.friend-suggest');
    var username = $(root).data('username');
    var answer = $(this).hasClass('btn-success') ? true : false;
    sendAnswerToFriendInvitation(username, answer);
});

//remove friend
$('#friends-list').on('click', '.remove-friend', function (event) {
    var root = $(this).closest('.friend-list-item');
    var username = $(root).data('username');
    session.call('friend/removeFriend', {'username': username}).then(
        function (result) {
            if (result.status.code == 1) {
                removeFromFriendList(username);
            }
            messenger.notification({'from': 'Bot', 'message': result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error + ', ' + desc});
        }
    );
});