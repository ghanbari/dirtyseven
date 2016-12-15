var window = self;
importScripts('/bundles/goswebsocket/js/vendor/autobahn.min.js', '/bundles/goswebsocket/js/gos_web_socket_client.js');
importScripts('/assets/mustache.js/mustache.js');
importScripts('/assets/js-php-unserialize/php-unserialize.js');
importScripts('/assets/emojione/lib/js/emojione.min.js');
emojione.ascii = true;

onmessage = function (event) {
    console.log('start work');
    var data = event.data;

    var socket = WS.connect(data.uri);

    socket.on('socket/connect', function(session) {
        session.call('user/get_chat_message', {username: data.myFriend, page: data.page}).then(
            function (result) {
                var archive = "";

                Mustache.parse(data.template_send);
                Mustache.parse(data.template_receive);
                var temp = null;
                var preMessage = null;

                for (var i = 0; i < result.data.messages.length; i++) {
                    var payload = PHPUnserialize.unserialize(result.data.messages[i]);

                    if (preMessage == null) {
                        preMessage = payload;
                        temp = emojione.shortnameToImage(payload.message);
                        continue;
                    }

                    if (payload.from == preMessage.from
                        && (new Date(payload.time)).getMinutes() == (new Date(preMessage.time)).getMinutes()
                    ) {
                        temp = emojione.shortnameToImage(payload.message) + '<br>' + temp;
                        continue;
                    } else {
                        var time = new Date(preMessage.time*1000);
                        archive = Mustache.render(
                            preMessage.from === data.myUsername ? data.template_send : data.template_receive,
                            {
                                username: preMessage.from,
                                message: '<p>' + temp + '</p>',
                                timestamp: time,
                                time: time.getHours() + ':' + time.getMinutes()
                            }
                        ) + archive;

                        preMessage = payload;
                        temp = emojione.shortnameToImage(payload.message);
                    }
                }

                time = new Date(preMessage.time*1000);
                archive = Mustache.render(
                    preMessage.from === data.myUsername ? data.template_send : data.template_receive,
                    {
                        username: preMessage.from,
                        message: '<p>' + temp + '</p>',
                        timestamp: time,
                        time: time.getHours() + ':' + time.getMinutes()
                    }
                ) + archive;

                postMessage(archive);
            },
            function (error, desc) {
                messenger.notification({from: 'Bot', message: 'Sorry, a error occur, if it occur again, please report to us.'});
                messenger.notification({from: 'Bot', message: error.toString() + ', ' + desc.toString()});
            }
        );
    });

    socket.on('socket/disconnect', function (error) {
    });
};