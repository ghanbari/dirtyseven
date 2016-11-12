//TODO: create a class that capsulise gameInvitations and current active game

function appendInvitation(username, answer) {
    $(".game_invited_users").loadTemplate(
        $("#game_invited_user"),
        {username: username},
        {
            append: true,
            success: function () {
                if (answer == 'accept') {
                    $('.game_invited_user[data-username="'+username+'"] .user-answer')
                        .addClass('fa-check text-success');
                } else if (answer == 'reject') {
                    $('.game_invited_user[data-username="'+username+'"] .user-answer')
                        .addClass('fa-close text-danger');
                } else {
                    $('.game_invited_user[data-username="'+username+'"] .user-answer')
                        .addClass('fa-question text-info');
                }
            }
        }
    );
}

function removeInvitation(username) {
    $('.game_invited_user[data-username="' + username + '"]').remove();
}

function removeInvitationsAndGame() {
    $('.game_invited_users').children().remove();
    $('#game-invitations').removeData('game-name');
    $('#game_invitation_expire').data('ttl', -1);
    $('#game_invitation_expire').text(moment.duration(0, "seconds").format("mm:ss"));
    changeMyStatus('online');
}

function appendGameSuggest(gameId, owner, name) {
    $('.game-suggests').loadTemplate(
        $('#game-suggest'),
        {
            invitedBy: owner,
            gameName: name,
            gameId: gameId
        },
        {append: true}
    );
}

function removeGameSuggest(gameId) {
    $('.game-suggest[data-game-id="' + gameId + '"]').remove();
}

socket.on('socket/connect', function (session) {
    session.call('games/get_active_game').then(
        function (result) {
            var data = result.data;
            if (result.status.code == 1 && data.game.status == 'waiting') {
                changeMyStatus('inviting');
                $('#game-invitations').data('game-name', data.game.name);
                $('#game_invitation_expire').data('ttl', data.ttl);
                runTtlTimer();
                $.each(data.invitations, function (username, answer) {
                    appendInvitation(username, answer);
                });
                $('#game-invitations').modal('toggle');
            } else {
                //TODO: open game table and show cards
            }
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );

    session.call('games/get_my_invitations').then(
        function (result) {
            if (result.status.code == 1) {
                $.each(result.data.invitations, function (gameId, game) {
                    appendGameSuggest(gameId, game.owner, game.name);
                });
            }
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

socket.on('socket/disconnect', function (error) {
    $('.game_invited_users').children().remove();
});

// expire timer for active game
function runTtlTimer() {
    $('.cancel-invitations').css('display', 'inline');
    var ttlTimer = setInterval(function () {
        var ttl = $('#game_invitation_expire').data('ttl');
        if (ttl == -1) {
            clearInterval(ttlTimer);
            ttlTimer = undefined;
            $(".game_invited_users").children().remove();
            $('.cancel-invitations').css('display', 'none');
        } else {
            $('#game_invitation_expire').data('ttl', ttl - 1);
            $('#game_invitation_expire').text(moment.duration(ttl, "seconds").format("mm:ss"));
        }
    }, 1000);
}

// open game invitations modal
$('a.game.create').click(function (event) {
    event.preventDefault();
    var current_game_type = $('#game-invitations').data('game-name');
    var game_type = $(this).data('game-name');

    if (current_game_type === undefined || game_type === current_game_type) {
        $('#game-invitations').data('game-name', game_type);
        $('#game-invitations').modal('toggle');
    } else {
        // show other modal and question from user, he will cancel current game?
        // if he cancel game, send request to server by call
    }
});

// update autocomplete list of friends
$(document).on('friends.update', function (event, data) {
    $('#invite-player input[name="player_name"]').autocomplete({source: data.friends});
    $('#invite-player input[name="player_name"]').autocomplete("option", "appendTo", "#invite-player");
});

// invite a player to game by form
$('#invite-player').submit(function (event) {
    event.preventDefault();
    var username = $(this).find('input[name="player_name"]').val();
    var gameName = $('#game-invitations').data('game-name');
    $(this).find('input[name="player_name"]').val('');

    session.call('games/invite_to_game', {'username': username, gameName: gameName}).then(
        function(result) {
            if (result['status']['code'] == 1) {
                changeMyStatus('inviting');
                var ttl = $('#game_invitation_expire').data('ttl');
                if (ttl === undefined || ttl <= 0) {
                    $('#game_invitation_expire').data('ttl', 3600);
                    runTtlTimer();
                }
                appendInvitation(username, 'waiting');
            }
            messenger.notification({from: 'Bot', message: result.status.message});
        },
        function(error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

$('.game_invited_users').on('click', 'button.cancel-invitation', function (event) {
    var root = $(this).closest('.game_invited_user');
    var username = $(root).data('username');
    session.call('games/remove_invitation', {username: username}).then(
        function (result) {
            if (result.status.code == 1) {
                removeInvitationsAndGame();
            } else if (result.status.code == 2) {
                removeInvitation(username);
            }
            messenger.notification({from: 'Bot', message: result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

$(document).on('game_invitation', function (event, payload) {
    if (payload.status == 'new') {
        new Notification(payload.from, {
            icon: '/web/images/icon.png',
            body: payload.from + ' invite from you to play ' + payload.gameName
        });

        $('#messeges *').remove();
        $("#messeges").loadTemplate(
            $("#messenger-game-invitation"),
            {
                gameId: payload.gameId,
                from: payload.from,
                gameName: payload.gameName
            }
        );
        messenger.playSound();

        appendGameSuggest(payload.gameId, payload.from, payload.gameName);
    } else {
        removeGameSuggest(payload.gameId);
        messenger.notification({from: payload.from, message: 'Sorry, i can not play with you now, perhaps we can play later.'});
    }
});