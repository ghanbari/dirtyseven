$(document).ready(function (event) {
    //$(document).on('show.bs.modal', function(event) {
    //    // we need another method that run only once and get user status then cache status
    //    //and changeStatus method do updating cache
    //    //if user status is free, we should not call this method
    //    session.call('user/invited_to_game').then(
    //        function (result) {
    //            changeStatus(result.data.status);
    //
    //            if (result.status.code == 200) {
    //                if (Object.keys(result.data.users).length == 0) {
    //                    return;
    //                }
    //                $.each(result.data.users, function(username, answer) {
    //                    var answerIcon = (answer == 'reject') ? 'fa-ban' : ((answer == 'accept') ? 'fa-check' : '');
    //                    $("#invited_users_list").loadTemplate(
    //                        $("#invited_user"),
    //                        {
    //                            username: username,
    //                            answer: '<span class="fa ' + answerIcon + '"></span>'
    //                        }
    //                    );
    //                });
    //            }
    //        },
    //        function (error, desc) {
    //            console.log('RPC Error: ', error, desc);
    //        }
    //    );
    //});

    //$('button#invite').click(function(event) {
    //    event.preventDefault();
    //    var username = $('input#invite_player').val();
    //    $('input#invite_player').val('');
    //
    //    session.call('user/invite_to_game', {'username': username}).then(
    //        function(result) {
    //            if (result['status']['code'] != 200) {
    //                messenger.write(result['status']['message']);
    //            } else {
    //                changeStatus('waiting');
    //                messenger.write(result['status']['message']);
    //                $("#invited_users_list").loadTemplate(
    //                    $("#invited_user"),
    //                    {username: username}
    //                );
    //            }
    //        },
    //        function(error, desc) {
    //            console.log("RPC Error", error, desc);
    //        }
    //    );
    //});

    //$('#invited_users_list').on('click', 'button.cancel_invitation', function (event) {
    //    session.call('user/remove_from_game').then();
    //});
});