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

    var connect = function () {
        _session.subscribe('game/seven/chat/' + _gameId, function (uri, payload) {
            switch (payload.type) {
                case 'played':
                    break;
                case 'turn':
                    endTurns();
                    specifyTurn(payload.player);
                    break;
            }
        });
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
        $('img.avatar.seat' + seat).remove();

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

    var drawMyCards = function () {
        clearPlayerCards(myUsername);
        myCards.forEach(function (name, index) {
            var card = $(Poker.getCardImage(cardHeight, name.charAt(0), name.substr(1)));
            card.data('name', name);
            card.addClass('varagh seat0');
            var marginLeft = (index - myCards.length / 2) * 40 / 100 * cardWidth;
            $(card).css('margin-left', marginLeft);
            card.draggable({
                containment: '.deck-container',
                revert: 'invalid',
                cursor: "move",
                delay: 300,
                opacity: 0.65,
                disabled: true
            });
            $('.deck-container').append(card);
        });
    };

    var drawOtherPlayerCards = function () {
        $.each(countOfPlayersCards, function (username) {
            if (username === myUsername) {
                return true;
            }

            drawPlayerCard(username);
        });
    };

    var drawPlayerCard = function (username) {
        var seat = seats[username];
        var countOfCard = countOfPlayersCards[username];
        if (countOfCard == $('img.varagh.seat' + seat).length && $('img.varagh.seat' + seat).first().height() == cardHeight) {
            return;
        }

        clearPlayerCards(username);
        for (var index = 0; index < countOfCard; index++) {
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
        }

        drawAvatar(username);
    };

    function drawMidCards() {
        $('img.varagh.mid').remove();
        $('.get-card').remove();

        var getCard = document.createElement('button');
        var icon = document.createElement('span');
        $(icon).addClass('fa fa-arrow-down');
        $(getCard).addClass('clear-button mid get-card');
        $(getCard).css({'margin-left': cardWidth * -2, 'font-size': cardWidth/2});
        $(getCard).append(icon);
        $('.deck-container').append(getCard);

        for (var i = 0; i < 3; i++) {
            var midCard = $(Poker.getBackImage(cardHeight));
            midCard.addClass('varagh mid');
            $(midCard).css('margin-left', - (cardWidth + (i*4)));
            $('.deck-container').append(midCard);
        }

        var reverseCard = $(Poker.getCardImage(cardHeight, topCard.charAt(0), topCard.substr(1)));
        reverseCard.addClass('varagh mid reverse');
        $(reverseCard).css('margin-left', '10px');
        $('.deck-container').append(reverseCard);
    }

    var endTurns = function () {
        $('.seat0-loading').clearQueue();
        $('.seat1-loading').clearQueue();
        $('.seat2-loading').clearQueue();
        $('.seat3-loading').clearQueue();
    };

    var specifyTurn = function (turn, till) {
        var seat = seats[turn];
        var animation = {};
        var option;

        if (till === undefined) {
            till = (new Date()).getTime() + 10000;
        }

        if (seat == 0 || seat == 2) {
            option = 'width';
        } else {
            option = 'height';
        }

        animation[option] = '100%';

        if (seat == 0) {
            myTurn();
        }

        $('.seat' + seat + '-loading').animate(
            animation,
            till - (new Date()).getTime(),
            'linear',
            function () {
                $(this).css(option, '0');

                if (seat == 0) {
                    console.log('drag disable');
                    $('.varagh.seat0').draggable('disable');
                    $('.get-card').css('display', 'none');
                }
            }
        );
    };

    $('.deck-container').on('click', '.get-card', function () {
        _session.call('game/seven/get_card').then(
            function (result) {
                if (result.status.code == 1) {
                    myCards.push(result.data.card);
                    myCards.sort();
                    drawMyCards();
                }
            },
            function (error, desc) {

            }
        );
    });

    var readCards = function () {
        _session.call('game/seven/get_game').then(
            function (result) {
                var unAlignedSeats = PHPUnserialize.unserialize(result.data.seats);
                if (Object.keys(unAlignedSeats).length == 2) {
                    $.each(unAlignedSeats, function (key, value) {
                        seats[key] = key == myUsername ? 0 : 2;
                    });
                } else {
                    var offset = -1 * unAlignedSeats[myUsername];
                    if (offset !== 0) {
                        $.each(unAlignedSeats, function (key, value) {
                            seats[key] = (offset + value) % Object.keys(unAlignedSeats).length;
                            if (seats[key] < 0) {
                                seats[key] += Object.keys(unAlignedSeats).length;
                            }
                        });
                    } else {
                        seats = unAlignedSeats;
                    }
                }

                myCards = result.data.cards.owner;
                myCards.sort();
                countOfPlayersCards = result.data.cards.users;
                topCard = result.data.topCard;

                adjust();
                drawMyCards();
                drawOtherPlayerCards();
                drawMidCards();

                if (result.data.status == 'playing') {
                    specifyTurn(result.data.turn, result.data.nextTurnAt * 1000);
                }
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    };

    var myTurn = function () {
        console.log('drag enable');
        $('.get-card').css('display', 'inline');
        $('.varagh.seat0').draggable('enable');
        $('#mid-dropable-aria').droppable({
            addClasses: false,
            drop: function( event, ui ) {
                var oldCard = $('.varagh.mid.reverse');

                var playRequest = function () {
                    _session.call('/game/seven/play', {'card': name}).then(
                        function (result) {
                            if (result.status.code == 1) {
                                $(oldCard).css('z-index', 999);
                                $(ui.draggable).css('z-index', 1000);

                                $(ui.draggable).animate(
                                    {left: oldCard.css('left'), top: oldCard.css('top'), marginLeft: '10px'},
                                    'slow',
                                    function () {
                                        playCard(ui.draggable.data('name'));

                                        oldCard.remove();

                                        $(ui.draggable).removeClass();
                                        $(ui.draggable).addClass('varagh mid reverse');
                                        $(ui.draggable).removeAttr('style');
                                        $(ui.draggable).css('margin-left', '10px');
                                        $(ui.draggable).draggable('destroy');
                                    }
                                );
                            }
                        },
                        function (error, desc) {
                            messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                            messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
                        }
                    );
                };

                playRequest();
            }
        });
    };

    var Game = function (session, gameId) {
        _gameId = gameId;
        _session = session;
        _this = this;
        readCards();
        connect();
        $(window).resize(function(){
            adjust();
            drawMyCards();
            drawOtherPlayerCards();
            drawMidCards();
        });
    };

    return {
        create: function (session, gameId) {
            return new Game(session, gameId);
        }
    };
})();