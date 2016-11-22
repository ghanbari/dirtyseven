var Seven = (function () {
    var _gameId;
    var _session;
    var _this;
    var myCards = [];
    var seats = {};
    var otherPlayerCards = {};
    var cardHeight;
    var cardWidth;

    var connect = function () {
        _session.subscribe('game/seven/chat/' + _gameId, function (uri, payload) {
            console.log(payload);
        });
    };

    var adjust = function () {
        cardHeight = $(document).height() / 6;
        cardWidth = cardHeight / 1.333333;
    };

    var drawMyCards = function () {
        myCards.forEach(function (name) {
            var card = $(Poker.getCardImage(cardHeight, name.charAt(0), name.substr(1)));
            card.data('name', name);
            drawCards(0, card);
        });
    };

    var drawOtherPlayerCards = function () {
        $.each(otherPlayerCards, function (username, count) {
            if (username === $.jStorage.get('myUsername')) {
                return true;
            }

            for (var i = 0; i < count; i++) {
                var card = $(Poker.getBackImage(cardHeight));
                drawCards(seats[username], card);
            }
        });
    };

    var searchObj = function (obj, query) {

        for (var key in obj) {
            var value = obj[key];

            if (typeof value === 'object') {
                return searchObj(value, query);
            }

            if (value === query) {
                return key;
            }

        }

    };

    var drawCards = function (seat, card) {
        card.addClass('varagh seat' + seat);

        var cartCount = otherPlayerCards[searchObj(seats, seat)];
        var index = $('img.varagh.seat' + seat).length;
        var rotate = 0;
        var rotateY = 0;
        var rotateX = 0;

        if (seat == 0) {
            translateX = (index - cartCount/2) * (cardWidth*0.55);
            translateY = ($(document).height() / 2) - (80 + cardHeight);
        } else if (seat == 1) {
            translateY = -1 * (($(document).width() / -2) + (cardWidth) + 50);
            translateX = ((cartCount/2 - index) * cardHeight * 0.3) +50 + cardHeight/2;
            rotate = -90;
        } else if (seat == 3) {
            translateX = ((index - cartCount/2) * cardHeight * 0.3) -50 - cardHeight/2;
            translateY = ($(document).width() / 2) - 50;
            rotate = 90;
        } else {
            translateX = (index - cartCount/2) * (cardWidth*0.55);
            translateY = ($(document).height() / -2) + (80 - (cardHeight/2));
            rotateX = 180;
        }

        var transform = 'rotate(' + rotate + 'deg) translate3d(' + translateX + 'px, '
            + translateY + 'px, 0px) rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg) ';
        card.css('transform', transform);

        $('.deck-container').append(card);
    };

    var drawAvatar = function (username) {
        var seat = seats[username];
        var div = document.createElement('div');
        var img = document.createElement('img');
        img.className = 'img img-fluid rounded-circle img-thumbnail avatar';
        $(img).data('username', username);
        $(img).data('size', 50);

        $(div).append(img);
        $(div).addClass('seat' + seat);
        $(div).css('position', 'absolute');
        $(div).css('top', '50%');
        $(div).css('left', '50%');
        var cartCount = otherPlayerCards[username];
        var index = $('img.varagh.seat' + seat).length;
        var rotate = 0;
        var rotateZ = 0;

        if (seat == 0) {
            translateX = (index - cartCount/2) * (cardWidth*0.55) + 50;
            translateY = ($(document).height() / 2) - (80 + cardHeight);
        } else if (seat == 1) {
            translateY = -1 * (($(document).width() / -2) + (cardWidth) + 50);
            translateX = ((cartCount/2 + index) * cardHeight * 0.3) -50 - cardHeight/2 + 50;
            rotate = -90;
            rotateZ = 90;
        } else if (seat == 3) {
            translateX = ((index - cartCount/2) * cardHeight * 0.3) -50 - cardHeight/2 + 80;
            translateY = ($(document).width() / 2) - 50;
            rotate = 90;
            rotateZ = -90;
        } else {
            translateX = -1 * ((index - cartCount/2) * (cardWidth*0.55) + 80);
            translateY = ($(document).height() / -2) + (80 - (cardHeight/2));
        }

        var transform = 'rotate(' + rotate + 'deg) translate3d(' + translateX + 'px, '
            + translateY + 'px, 0px) rotateZ('+rotateZ+'deg)';
        $(div).css('transform', transform);
        $('.deck-container').append(div);
    };

    function drawAvatars() {
        $.each(seats, function (username, seat) {
            drawAvatar(username);
        });
    }

    function drawMidCards(top) {
        var midCard = $(Poker.getBackImage(cardHeight));
        midCard.addClass('varagh');
        $(midCard).css('transform', 'translate3d(-' + 1.2 * cardWidth + 'px, -100%, 0px)');
        $('.deck-container').append(midCard);

        var topCard = $(Poker.getCardImage(cardHeight, top.charAt(0), top.substr(1)));
        topCard.addClass('varagh');
        $(topCard).css('transform', 'translate3d(0, -100%, 0px)');
        $('.deck-container').append(topCard);
    }

    var readCards = function () {
        _session.call('game/seven/get_game').then(
            function (result) {
                var unAlignedSeats = PHPUnserialize.unserialize(result.data.seats);
                var myUsername = $.jStorage.get('myUsername');
               if (Object.keys(unAlignedSeats).length == 2) {
                   $.each(unAlignedSeats, function (key, value) {
                       seats[key] = key == $.jStorage.get('myUsername') ? 0 : 2;
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
                otherPlayerCards = result.data.cards.users;

                adjust();
                drawMyCards();
                drawOtherPlayerCards();
                drawAvatars();
                drawMidCards(result.data.topCard);
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    };

    $(window).resize(function(){
        //adjust();
        //drawMyCards();
        //drawOtherPlayerCards();
    });

    var Game = function (session, gameId) {
        _gameId = gameId;
        _session = session;
        _this = this;
        connect();
        readCards();
    };

    return {
        create: function (session, gameId) {
            return new Game(session, gameId);
        }
    };
})();