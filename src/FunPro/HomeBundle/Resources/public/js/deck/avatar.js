var avatars = (function () {
    var updateSrc = function () {
        var images = $.jStorage.get('avatars');
        var not_loaded = $('img.avatar:not([src]), img.avatar[src$="default.png"]');
        $.each(not_loaded, function (index, image) {
            var username = $(image).data('username');
            var size = $(image).data('size');

            if (images[username] != undefined) {
                $(image).attr('src', avatars.getUrl(images[username], size));
            }
        });
    };

    var avatar = function () {
        if ($.jStorage.index().indexOf('avatars') === -1) {
            $.jStorage.set('avatars', {});
            $.jStorage.setTTL('avatars', 86400000);
        }

        this._new_avatars = [];
        this._baseUrl = "https://www.gravatar.com/avatar/";
    };

    avatar.prototype.getUrl = function (url, size) {
        return this._baseUrl + url + '?d=identicon' + "&s=" + size;
    };

    avatar.prototype.loadNewImage = function () {
        var avatars = $.jStorage.get('avatars');
        var that = this;
        $.post('/user/avatars', {usernames: this._new_avatars}, function(data, status, xhr) {
            if (status === 'success') {
                $.each(data, function (username, url) {
                    avatars[username] = url;
                });

                that._new_avatars = [];
                var ttl = $.jStorage.getTTL('avatars');
                $.jStorage.set('avatars', avatars);
                $.jStorage.setTTL('avatars', ttl);

                updateSrc();
            }
        });
    };

    avatar.prototype.load = function () {
        var images = $('img.avatar');
        var that = this;
        $.each(images, function (key, image) {
            var username = $(image).data('username');
            var size = $(image).data('size');
            if (username == undefined || size == undefined) {
                console.log('can not load avatar, size or username is not defined', image);
                return true;
            }

            if (!$.jStorage.get('avatars').hasOwnProperty(username)) {
                that._new_avatars.push(username);
            }
        });

        if (that._new_avatars.length > 0) {
            this.loadNewImage();
        } else {
            updateSrc();
        }
    };

    return new avatar();
})();

$(document).on('DOMNodeInserted', function(e) {
    if ($(e.target).has('.avatar').length || $(e.target).hasClass('avatar')) {
        avatars.load();
    }
});