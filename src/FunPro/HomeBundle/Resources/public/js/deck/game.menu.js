//TODO: create a class that capsulise gameInvitations and current active game

function showActiveGame() {
    session.call('games/get_active_game').then(
        function (result) {
            var data = result.data;
            if (result.status.code == 1 && data.game.status == 'waiting') {
                if (data.game.owner === $.jStorage.get('myUsername')) {
                    $('#game-invitations').data('game-name', data.game.name);
                    $('#game_invitation_expire').data('ttl', data.ttl);
                    runTtlTimer();
                    $.each(data.invitations, function (username, answer) {
                        appendInvitation(username, answer);
                    });
                    $('#game-invitations').modal('toggle');
                    $('.cancel-invitations').css('display', 'inline');
                } else {
                    $('#current-game-link').removeClass('hidden-xs-up');
                    $('#my_invitation_expire').data('ttl', data.ttl);
                    $('#current-game').data('game-id', data.id);

                    var ttlTimer = setInterval(function () {
                        var ttl = $('#my_invitation_expire').data('ttl');
                        if (ttl == -1) {
                            clearInterval(ttlTimer);
                            ttlTimer = undefined;
                            $('#current-game-link').addClass('hidden-xs-up');
                            $('#game-invitations').removeData('game-name');
                            $('#my_invitation_expire').data('ttl', 0);
                        } else {
                            $('#my_invitation_expire').data('ttl', ttl - 1);
                            $('#my_invitation_expire').text(moment.duration(ttl, "seconds").format("mm:ss"));
                        }
                    }, 1000);

                    var usernames = [data.game.owner];

                    $.each(data.invitations, function (key, value) {
                        if (value == 'accept') {
                            usernames.push(key);
                        }
                    });

                    $.each(usernames, function (index, username) {
                        $('.current-game').loadTemplate(
                            $('#current-game-members'),
                            {username: username},
                            {append: true}
                        );
                    });
                    $('#current-game').modal('toggle');
                }
            } else {
                //TODO: open game table and show cards
            }
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
}

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

// add all sent & receive invitations & resume active games
socket.on('socket/connect', function (session) {
    showActiveGame();

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

// clear all sent & receive invitations
socket.on('socket/disconnect', function (error) {
    $('.game_invited_users').children().remove();
    $('.game-suggests').children().remove();
});

$('#current-game').on('game_status', function (event, payload) {
    if (payload.status == 'update_players') {
        if ($('#current-game').data('game-id') != payload.gameId) {
            console.log('current game expired?');
            return;
        }

        $('.current-game').children().remove();
        $.each(payload.players, function (index, username) {
            $('.current-game').loadTemplate(
                $('#current-game-members'),
                {username: username},
                {append: true}
            );
        });
    } else {
        //TODO: start or resume game?
    }
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

// update auto complete list of friends
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

// when owner cancel a invitation
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

$('#cancel-invitations').click(function (event) {
    session.call('games/remove_invitations').then(
        function (result) {
            removeInvitationsAndGame();
            messenger.notification({from: 'Bot', message: result.status.message});
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

// when a game invitation is received
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

        if ($('#current-game').data('game-id') == payload.gameId) {
            $('#current-game-link').addClass('hidden-xs-up');
            $('#game-invitations').removeData('game-name');
            $('#my_invitation_expire').data('ttl', 0);
            $('.current-game').children().remove();

            $('#current-game .close').click();
            $('#current-game').removeData('game-id');
        }
    }
});

$('.game-suggests, #messeges').on('click', '.answer-game-suggest', function () {
    var gameId = $(this).parent().data('game-id');
    var answer = $(this).hasClass('btn-success') ? 'accept' : 'reject';
    session.call('games/answer_to_game_invitation', {gameId: gameId, answer: answer}).then(
        function (result) {
            messenger.notification({from: 'Bot', message: result.status.message});

            if (result.status.code === 1) {
                $('.game-suggest[data-game-id="' + gameId + '"]').remove();
                showActiveGame();
                //TODO: how can user expire invitation?
            }
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});

$(document).on('answer_to_game_invitation', function (event, payload) {
    var icon = payload.answer === 'accept' ? 'fa-check text-success' : 'fa-close text-danger';
    $('.game_invited_user[data-username="' + payload.from + '"] span.user-answer')
        .removeClass('fa-question text-info')
        .addClass(icon);
});

$('#cancel_current_game').click(function (event) {
    var gameId = $('#current-game').data('game-id');
    var answer = 'reject';
    session.call('games/answer_to_game_invitation', {gameId: gameId, answer: answer}).then(
        function (result) {
            messenger.notification({from: 'Bot', message: result.status.message});
            removeGameSuggest(gameId);
            $('#current-game-link').addClass('hidden-xs-up');
            $('#game-invitations').removeData('game-name');
            $('#my_invitation_expire').data('ttl', 0);
            $('.current-game').children().remove();

            $('#current-game .close').click();
            $('#current-game').removeData('game-id');
        },
        function (error, desc) {
            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
        }
    );
});