var Seven = (function () {
    var _gameId;
    var _session;
    var _this;
    var cardHeight;
    var cardWidth;
    var myCards = [];
    var seats = {};
    var countOfPlayersCards = {};
    var topCard;
    var turnTime;
    var currentTurn;

    var discardCard = function (player, topCard) {
        var seat = seats[player];
        var card = $('.varagh.seat' + seat).last();
        $(card).animate(
            {
                top: '48%',
                left: '50%',
                marginLeft: '10px',
                transform: 'rotateY(90deg)'
            },
            'slow',
            function () {
                $('.varagh.mid.reverse').remove();
                $(card).remove();
                drawTopCard(topCard);
            }
        );
    };

    var discardWrongCard = function (player, wrongCard) {
        var seat = seats[player];
        var oldCard = $('.varagh.seat' + seat).last();
        var card = $(Poker.getCardImage(cardHeight, wrongCard.charAt(0), wrongCard.substr(1)));
        card.attr('style', oldCard.attr('style'));
        card.addClass('varagh seat' + seat);

        oldCard.css('display', 'none');
        $('.deck-container').append(card);

        $(card).animate(
            {
                top: '48%',
                left: '50%',
                marginLeft: '10px'
            },
            1000,
            function () {
                $(card).animate(
                    {
                        top: oldCard.css('top'),
                        left: oldCard.css('left'),
                        marginLeft: oldCard.css('margin-left')
                    },
                    1000,
                    function () {
                        card.remove();
                        oldCard.css('display', 'inline');
                    }
                );
            }
        );
    };

    var connect = function () {
        _session.subscribe('game/seven/chat/' + _gameId, function (uri, payload) {
            switch (payload.type) {
                case 'notification':
                    if (typeof payload.message === 'string') {
                        messenger.notification({from: 'Bot', message: payload.message}, false);
                    } else {
                        payload.message.forEach(function (message) {
                            messenger.notification({from: 'Bot', message: message}, false);
                        });
                    }
                    break;
                case 'penalty':
                    payload.cards.forEach(function (cardName, index) {
                        if (!cardName) {
                            return;
                        }
                        var message = 'You get ' + getEmojiNameOfCard(cardName) + ' as penalty';
                        messenger.notification({from: 'Bot', message: message}, false);
                        drawMyPickedCard(cardName, index == (payload.cards.length - 1));
                    });
                    break;
                case 'playing':
                    //end previous turn
                    if (payload.player !== undefined) {
                        endTurn(seats[payload.player]);
                    }

                    if (payload.hasOwnProperty('cards') && payload.cards.length !== 0) {
                        $.each(payload.cards, function (username, count) {
                            //FIXME: when user can pick multiplie card, we need timeout?
                            if (username !== myUsername) {
                                if (countOfPlayersCards[username] < count) {
                                    var newCount = count - countOfPlayersCards[username];
                                    for (var i = 0; i < newCount; i++) {
                                        countOfPlayersCards[username] += 1;
                                        drawPickedCard(username);
                                    }
                                    var message = username + ' get ' + newCount + ' card as penalty';
                                    messenger.notification({from: 'Bot', message: message}, false);
                                } else if (countOfPlayersCards[username] > count) {
                                    countOfPlayersCards[username] = count;
                                }
                            }
                        });
                    }

                    if (payload.player !== undefined && payload.player !== myUsername) {
                        if (payload.topCard !== undefined) {
                            var message = payload.player + ' played ' + getEmojiNameOfCard(payload.topCard);
                            messenger.notification({from: 'Bot', message: message}, false);
                            discardCard(payload.player, payload.topCard);
                        } else if (payload.wrongCard !== undefined) {
                            discardWrongCard(payload.player, payload.wrongCard);
                        }
                    }

                    if (payload.nextTurn !== undefined) {
                        var till = (new Date()).getTime() + (turnTime * 1000);
                        currentTurn = payload.nextTurn;
                        startTurn(till);
                    }
                    break;
                case 'finish_round':
                    $.each(seats, function (username, seat) {
                        $('div.seat' + seat + ' img.avatar').parent().remove();
                        endTurn(seat);
                    });

                    clearGameScore();
                    updateGameScore(payload.roundScore, payload.previousScore, payload.finalScore);
                    $('#game-score').modal('toggle');

                    clearTurn();
                    $('.get-card').remove();
                    $('.varagh').remove();
                    removeInvitationsAndGame();

                    if (payload.finished) {
                        messenger.notification({from: 'Bot', message: 'Finish game'});

                        _session.unsubscribe('game/seven/chat/' + _gameId);
                    }

                    $('#chat-room-container').show();
                    break;
                case 'start_round':
                    $('#game-score .close').click();
                    readCards();
                    break;
            }
        });
    };

    var clearGameScore = function () {
        $('table.game-score thead').children().remove();
        $('table.game-score tbody').children().remove();
    };

    var updateGameScore = function (roundScores, previousScores, finalScores) {
        var finalScoresSorted = [];
        for (var username in finalScores) {
            finalScoresSorted.push([username, finalScores[username]])
        }

        finalScoresSorted.sort(function (a, b) {
            return a[1] - b[1]
        });

        var header_row = document.createElement('tr');
        var header_column = document.createElement('th');
        header_column.innerHTML = '#';
        header_row.appendChild(header_column);

        var current_score_row = document.createElement('tr');
        var current_score_title = document.createElement('td');
        current_score_title.innerHTML = 'Current Score';
        current_score_row.appendChild(current_score_title);

        var previous_score_row = document.createElement('tr');
        var previous_score_title = document.createElement('td');
        previous_score_title.innerHTML = 'Previous Score';
        previous_score_row.appendChild(previous_score_title);

        var final_score_row = document.createElement('tr');
        var final_score_title = document.createElement('td');
        final_score_title.innerHTML = 'Final Score';
        final_score_row.appendChild(final_score_title);

        finalScoresSorted.forEach(function (finalScore) {
            var username = finalScore[0];
            var score = finalScore[1];

            var th = document.createElement('th');
            th.innerHTML = username;
            header_row.appendChild(th);

            var current_score_td = document.createElement('td');
            current_score_td.innerHTML = roundScores[username];
            current_score_row.appendChild(current_score_td);

            var previous_score_td = document.createElement('td');
            var previous_score = previousScores.hasOwnProperty(username) ? previousScores[username] : 0;
            previous_score_td.innerHTML = previous_score;
            previous_score_row.appendChild(previous_score_td);

            var final_score_td = document.createElement('td');
            final_score_td.innerHTML = score;
            final_score_row.appendChild(final_score_td);

            messenger.notification({
                from: 'Bot',
                message: username + ': ' + previous_score.toString() + ' + ' + roundScores[username] + ' = ' + score.toString()
            });
        });

        $('table.game-score thead').append(header_row);
        $('table.game-score tbody').append(previous_score_row);
        $('table.game-score tbody').append(current_score_row);
        $('table.game-score tbody').append(final_score_row);
    };

    var getEmojiNameOfCard = function (cardName) {
        switch (cardName.charAt(0)) {
            case 'c':
                return ':clubs:' + cardName.substr(1).toUpperCase();
            case 'd':
                return ':diamonds:' + cardName.substr(1).toUpperCase();
            case 'h':
                return ':hearts:' + cardName.substr(1).toUpperCase();
            case 's':
                return ':spades:' + cardName.substr(1).toUpperCase();
        }
    };

    var adjust = function () {
        cardHeight = $(document).height() / 6;
        cardWidth = cardHeight / 1.333333;

        $('#mid-dropable-aria').height(cardHeight * 2);
        $('#mid-dropable-aria').width(cardWidth * 5);
    };

    var clearPlayerCards = function (username) {
        var seat = seats[username];
        $('img.varagh.seat' + seat).remove();
    };

    var drawAvatar = function (username) {
        var seat = seats[username];
        $('div.seat' + seat + ' img.avatar').parent().remove();

        var div = document.createElement('div');
        var img = document.createElement('img');
        var span = document.createElement('span');

        $(img).attr('alt', username);
        $(img).attr('title', username);
        $(img).data('username', username);
        $(img).data('size', cardHeight/2.2);
        $(img).addClass('img img-fluid rounded-circle img-thumbnail avatar');


        $(span).addClass('fa fa-circle user-status');
        $(span).attr('data-username', username);
        $(span).css('position', 'absolute');

        $(div).data('username', username);
        $(div).addClass('seat' + seat);
        $(div).append(span);
        $(div).append(img);

        if (seat == 0) {
            return;
        } else if (seat == 2) {
            $(div).css('margin-top', cardHeight * 1.1);
            $(div).css('margin-left', -25);
        } else if (seat == 3) {
            $(div).css('margin-left', cardWidth * 1.1);
            //55 menu height, 25 half of image size
            $(div).css('margin-top', -55 - cardHeight/2);
        } else if (seat == 1) {
            $(div).css('margin-right', cardWidth * 1.1);
            //55 menu height, 25 half of image size
            $(div).css('margin-top', -55 - cardHeight/2);
        }
        $('.deck-container').append(div);
    };

    var drawMyCard = function (name) {
        if (myCards.length > 15) {
            cardHeight = $(document).height() / 7;
        } else if (myCards.length > 20) {
            cardHeight = $(document).height() / 8;
        } else if (myCards.length > 25) {
            cardHeight = $(document).height() / 9;
        }

        var card = $(Poker.getCardImage(cardHeight, name.charAt(0), name.substr(1)));
        card.data('name', name);
        card.addClass('varagh seat0');
        var marginLeft = ($('.varagh.seat0').length - myCards.length / 2) * 40 / 100 * cardWidth;
        $(card).css('margin-left', marginLeft);
        card.draggable({
            containment: '.deck-container',
            revert: 'invalid',
            cursor: "move",
            opacity: 0.65,
            disabled: true,
            drag: function (event, ui) {
                if ($(this).data('position') === undefined) {
                    $(this).data('position', ui.position);
                }
            }
        });
        $('.deck-container').append(card);
    };

    var drawMyCards = function () {
        clearPlayerCards(myUsername);
        myCards.forEach(function (name) {
            drawMyCard(name);
        });

        if (currentTurn == myUsername) {
            $('.varagh.seat0').draggable('enable');
        } else {
            $('.varagh.seat0').draggable('disable');
        }
    };

    var drawPlayersCards = function () {
        $.each(countOfPlayersCards, function (username) {
            if (username === myUsername) {
                return true;
            }

            drawPlayerCards(username);
        });
    };

    var drawPlayerCards = function (username, force) {
        var seat = seats[username];
        if (!force && (countOfPlayersCards[username] == $('img.varagh.seat' + seat).length && $('img.varagh.seat' + seat).first().height() == cardHeight)) {
            return;
        }

        clearPlayerCards(username);
        for (var index = 0; index < countOfPlayersCards[username]; index++) {
            drawPlayerCard(username);
        }

        drawAvatar(username);
    };

    var drawPlayerCard = function (username) {
        var seat = seats[username];
        var index = $('.varagh.seat' + seat).length;
        var card = $(Poker.getBackImage(cardHeight));
        card.addClass('varagh seat' + seat);

        if (seat == 2) {
            //-2 = last card show in fullwidth
            var marginLeft = (index - 2 - countOfPlayersCards[username] / 2) * 20 / 100 * cardWidth;
            $(card).css('margin-left', marginLeft);
        } else {
            var height = cardHeight;
            if (countOfPlayersCards[username] > 10) {
                height = $(document).height() / 7;
            } else if (countOfPlayersCards[username] > 15) {
                height = $(document).height() / 8;
            } else if (countOfPlayersCards[username] > 20) {
                height = $(document).height() / 9;
            }
            //-2 = last card show in fullHeight, 55 is size of menu
            var marginTop = (index - 2 - countOfPlayersCards[username] / 2) * 20 / 100 * height - 55;
            $(card).css('margin-top', marginTop);
        }

        $('.deck-container').append(card);
    };

    var drawPickCardButton = function () {
        $('.get-card').remove();

        var getCard = document.createElement('button');
        var icon = document.createElement('span');
        $(icon).addClass('fa fa-arrow-down');
        $(getCard)
            .addClass('clear-button mid get-card')
            .css({'margin-left': cardWidth * -2, 'font-size': cardWidth/2})
            .click(pickCard)
            .append(icon);
        $('.deck-container').append(getCard);
    };

    var drawCardsStack = function () {
        $('img.varagh.mid').remove();
        for (var i = 0; i < 3; i++) {
            var midCard = $(Poker.getBackImage(cardHeight));
            midCard.addClass('varagh mid');
            $(midCard).css('margin-left', -(cardWidth + (i * 4)));
            $('.deck-container').append(midCard);
        }
    };

    var drawTopCard = function (topCard) {
        drawCardsStack();

        var reverseCard = $(Poker.getCardImage(cardHeight, topCard.charAt(0), topCard.substr(1)));
        reverseCard.addClass('varagh mid reverse');
        $(reverseCard).css('margin-left', '10px');
        $('.deck-container').append(reverseCard);
    };

    var drawMid = function () {
        drawPickCardButton();
        drawTopCard(topCard);
    };

    var endTurn = function (seat) {
        $('.seat' + seat + '-loading').finish();
    };

    var clearTurn = function () {
        $('.pick-color').children().remove();
    };

    var startTurn = function (till) {
        var seat = seats[currentTurn];
        var animation = {};
        var option;

        clearTurn();

        if (seat == 0 || seat == 2) {
            option = 'width';
        } else {
            option = 'height';
        }

        animation[option] = '100%';

        if (seat == 0) {
            $('.varagh.seat0').draggable('enable');
            myTurn();
        } else {
            $('.varagh.seat0').draggable('disable');
        }

        $('.seat' + seat + '-loading').animate(
            animation,
            till - (new Date()).getTime(),
            'linear',
            function () {
                $(this).css(option, '0');
            }
        );
    };

    var drawPickedCard = function (username) {
        var seat = seats[username];
        var card = $(Poker.getBackImage(cardHeight));
        $(card).addClass('varagh mid');
        $('.deck-container').append(card);
        $(card).switchClass('mid', 'seat' + seat);
        setTimeout(function () {
            drawPlayerCards(username, true);
        }, 500);
    };

    var drawMyPickedCard = function (cardName, redrawCards) {
        myCards.push(cardName);
        myCards.sort();

        var card = $(Poker.getCardImage(cardHeight, cardName.charAt(0), cardName.substr(1)));
        $(card).addClass('varagh mid');

        var marginLeft = ($('.varagh.seat0').length - myCards.length / 2) * 40 / 100 * cardWidth;
        $(card).css('margin-left', marginLeft);

        $('.deck-container').append(card);
        $(card).animate(
            {
                bottom: '8px',
                marginLeft: (myCards.indexOf(cardName) - myCards.length / 2) * 40 / 100 * cardWidth,
                transform: 'rotateY(90)'
            },
            'slow',
            function () {
                $(card).remove();
                if (redrawCards) {
                    drawMyCards();
                }
            }
        );
    };

    var pickCard = function () {
        _session.call('game/seven/get_card').then(
            function (result) {
                if (result.status.code == 1) {
                    if (result.data.cards.length == 0) {
                        return;
                    }

                    result.data.cards.forEach(function (cardName, index) {
                        drawMyPickedCard(cardName, index == (result.data.cards.length - 1));
                    });
                } else {
                    messenger.notification({from: 'Bot', message: result.status.message});
                }
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    };

    var readCards = function () {
        _session.call('game/seven/get_game').then(
            function (result) {
                var unAlignedSeats = PHPUnserialize.unserialize(result.data.seats);
                if (Object.keys(unAlignedSeats).length == 2) {
                    $.each(unAlignedSeats, function (username, seat) {
                        seats[username] = username == myUsername ? 0 : 2;
                    });
                } else {
                    var offset = -1 * unAlignedSeats[myUsername];
                    $.each(unAlignedSeats, function (username, seat) {
                        seats[username] = (offset + seat) < 0 ?
                            (offset + seat + Object.keys(unAlignedSeats).length) : (offset + seat);
                    });
                }

                myCards = result.data.cards.owner;
                myCards.sort();
                countOfPlayersCards = result.data.cards.users;
                topCard = result.data.topCard;
                turnTime = result.data.turnTime;

                adjust();
                drawMyCards();
                drawPlayersCards();
                drawMid();

                if (result.data.status == 'playing') {
                    currentTurn = result.data.nextTurn;
                    startTurn(result.data.nextTurnAt * 1000);
                }
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    };

    var myTurn = function () {
        $('#mid-dropable-aria').droppable({
            addClasses: false,
            drop: function(event, ui) {
                var oldCard = $('.varagh.mid.reverse');

                var playRequest = function (extra) {
                    _session.call('game/seven/play', {'card': ui.draggable.data('name'), 'extra': extra}).then(
                        function (result) {
                            if (result.status.code == 1) {
                                myCards.splice(myCards.indexOf(ui.draggable.data('name')), 1);
                                $(oldCard).css('z-index', 999);
                                $(ui.draggable).css('z-index', 1000);

                                $(ui.draggable).animate(
                                    {left: oldCard.css('left'), top: oldCard.css('top'), marginLeft: '10px'},
                                    'slow',
                                    function () {
                                        var cardName = ui.draggable.data('name');
                                        $('.varagh.mid.reverse[data-name!="' + cardName + '"]').remove();
                                        $(ui.draggable).remove();
                                        if (cardName.charAt(1) == 'j' && extra.hasOwnProperty('color')) {
                                            cardName = extra['color'] + 1;
                                        }
                                        drawTopCard(cardName);
                                    }
                                );
                            } else if (result.status.code == -2) {
                                //drawMyPickedCard(result.data.penalties);
                                //ui.draggable.animate($(ui.draggable).data('position'), 500);
                                //setTimeout(drawMyCards, 500);
                            } else if (result.status.code == -3) {
                                ui.draggable.animate($(ui.draggable).data('position'), 500);
                                setTimeout(drawMyCards, 500);
                                result.data.penalties.forEach(function (cardName, index) {
                                    if (!cardName) {
                                        return;
                                    }

                                    drawMyPickedCard(cardName, index == (result.data.penalties.length - 1));
                                });
                            }
                        },
                        function (error, desc) {
                            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
                        }
                    );
                };

                var cardName = ui.draggable.data('name');
                var cardNumber = cardName.substr(1);
                if (cardNumber === 'j') {
                    var colors = ['h', 's', 'd', 'c'];
                    colors.forEach(function (color) {
                        var card = $(Poker.getCardImage(cardHeight, color, '1'));
                        $(card)
                            .data('name', color)
                            .addClass('varagh')
                            .css('padding-right', '5px')
                            .click(function () {
                                var color = $(this).data('name');
                                $('#pick-color').modal('toggle');
                                $('.pick-color').children().remove();
                                playRequest({color: color});
                            });
                        $('.pick-color').append(card);
                    });
                    $('#pick-color').modal('toggle');
                } else if (cardNumber === '2') {
                    if (Object.keys(seats).length== 2) {
                        $.each(seats, function (username) {
                            if (username == myUsername) {
                                return;
                            }

                            playRequest({target: username});
                            return;
                        });
                        return;
                    }

                    $.each(seats, function (username) {
                        if (username == myUsername) {
                            return;
                        }
                        var btn = document.createElement('button');
                        $(btn)
                            .text(username)
                            .addClass('btn btn-info')
                            .css('padding-right', '5px')
                            .click(function () {
                                var target = $(this).text();
                                $('#pick-color').modal('toggle');
                                $('.pick-color').children().remove();
                                playRequest({target: target});
                            });
                        $('.pick-color').append(btn);
                    });
                    $('#pick-color').modal('toggle');
                } else {
                    playRequest();
                }
            }
        });
    };

    var Game = function (session, gameId) {
        _gameId = gameId;
        _session = session;
        _this = this;
        readCards();
        connect();
        $('#chat-room-container').hide();
        $(window).resize(function(){
            adjust();
            drawMyCards();
            drawPlayersCards();
            drawMid();
        });
    };

    return {
        create: function (session, gameId) {
            return new Game(session, gameId);
        }
    };
})();