$(document).ready(function () {
    userStatus = (function (){
        var users = {};

        var updateStatus = function () {
            session.call('friend/friends').then(
                function (result) {
                    $.each(result.data.friends, function (friend, status) {
                        if (users.hasOwnProperty(friend) && users[friend] == status) {
                            return true;
                        }

                        users[friend] = status;
                        userStatus.updateUI([friend]);
                    });
                },
                function(error, desc) {
                    messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                    messenger.notification({from: 'Bot', message: error + ', ' + desc});
                }
            );
        };

        var Status = function () {
            updateStatus();
            setTimeout(updateStatus, 180000);
        };

        Status.prototype.getStatus = function (username) {
            return users.hasOwnProperty(username) ? users[username] : 'offline';
        };

        Status.prototype.update = function (username, status) {
            if (users.hasOwnProperty(username)) {
                users[username] = status;
                this.updateUI([username]);
            }
        };

        Status.prototype.updateUI = function (usernames) {
            usernames = usernames !== undefined ? usernames : Object.keys(users);
            $.each(usernames, function (index, username) {
                var nodes = $('span.user-status[data-username="' + username + '"');
                $.each(nodes, function (index, node) {
                    var oldStatus = $(node).data('status') ? $(node).data('status') : 'offline';
                    $(node)
                        .removeClass(oldStatus)
                        .addClass(users[username])
                        .data('status', users[username]);
                });
            });
        };

        return new Status();
    })();
});

$(document).on('DOMNodeInserted', function(e) {
    if ($(e.target).has('.user-status').length) {
        $.each($(e.target).find('span.user-status'), function (index, node) {
            var username = $(node).data('username');
            if (username === undefined) {
                return true;
            }
            var status = userStatus.getStatus(username);
            $(node)
                .data('status', status)
                .addClass(status);
        });
    }
});

$('.friends-list').on('friend_status', function (event, payload) {
    userStatus.update(payload.username, payload.status);
});