var avatars = (function () {
    var new_usernames = [];
    var urls = {};
    var base_url = "https://www.gravatar.com/avatar/";

    var getUrl = function (url, size) {
        return 'https://www.gravatar.com/avatar/' + url + '?d=identicon' + "&s=" + size;
    };

    var avatar = function () {};
    avatar.prototype.add = function (username, selector, size) {
        if (!urls.hasOwnProperty(username)) {
            new_usernames.push(username);
            urls[username] = {selector: selector, size: size, url: null};
        }
    };

    avatar.prototype.remove = function (username) {
        var index = new_usernames.indexOf(username);
        new_usernames.splice(index, 1);
        urls.remove(username);
    };

    avatar.prototype.sync = function () {
        $.post('/app_dev.php/user/avatars', {usernames: new_usernames}, function(data, status, xhr) {
            if (status === 'success') {
                $.each(data, function (username, url) {
                    urls[username]['url'] = url;
                    $(urls[username]['selector']).attr('src', getUrl(url, urls[username]['size']));
                });
            }
        });
    };

    return new avatar();
})();