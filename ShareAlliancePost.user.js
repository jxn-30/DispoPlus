// ==UserScript==
// @name         ShareAlliancePost
// @namespace    Leitstellenspiel
// @version      2.6.1
// @author       jalibu, JuMaHo
// @include      https://www.leitstellenspiel.de/missions/*
// ==/UserScript==

(() => {
    'use strict';

    const jumpNext = true; // Set to 'true', to jump to next mission after submitting an alert.
    const enableKeyboard = true; // Set to 'false', to disable keyboard shortcuts.
    const shortcutKeys = [17, 68]; // 17= ctrl, 68 = d
    const postToChat = true; // Set to 'false', to disable post in alliance chat.
    const message = 'Frei zum Mitverdienen!';

    // Create Button and add event listener
    const initButtons = () => {
        const btnMarkup = '<a href="#" class="btn btn-success btn-sm alert_notify_alliance hidden-xs" title="Alarmieren, im Verband freigeben und Nachricht in Verbands-Chat"><img class="icon icons8-Phone-Filled" src="/images/icons8-phone_filled.svg" width="18" height="18"> <img class="icon icons8-Share" src="/images/icons8-share.svg" width="20" height="20"> <span class="glyphicon glyphicon-bullhorn" style="font-size: 13px;"></span></a>';
        $('.alert_next_alliance').parent().append(btnMarkup);

        if(jumpNext){
            $('.alert_notify_alliance').append('<span style="margin-left: 5px;" class="glyphicon glyphicon-arrow-right"></span>');
        }

        $('.alert_notify_alliance').click(processAllianceShare);
    };

    // Add Keylisteners
    const initKeys = () => {
        if(enableKeyboard){
            let keys = [];

            $(document).keydown((e) => {
                keys.push(e.which);
                if(keys.length === shortcutKeys.length){
                    console.log('jo');
                    let pressedAll = true;
                    $.each(shortcutKeys, (index, value) =>{
                        if(keys.indexOf(value) < 0){
                            pressedAll = false;
                            return;
                        }
                    });
                    if(pressedAll){
                        processAllianceShare();
                    }
                }
            });

            $(document).keyup((e) => {
                keys.splice(keys.indexOf(e.which));
            });
        }
    };

    const processAllianceShare = () => {

        const sendToAlliance = postToChat ? 1 : 0;
        const missionShareLink = $('#mission_alliance_share_btn').attr('href');
        const missionId = missionShareLink.replace('/missions/','').replace('/alliance', '');
        const csrfToken = $('meta[name="csrf-token"]').attr('content');

        $('.alert_notify_alliance').html('Teilen..');
        $.get('/missions/' + missionId + '/alliance' , () => {
            $('.alert_notify_alliance').html('Chatten..');
            $.post( "/mission_replies", {authenticity_token: csrfToken, mission_reply: {alliance_chat: sendToAlliance, content: message, mission_id: missionId}}, (data, status, xhr) => {
                $('.alert_notify_alliance').html('Alarmieren..');
                if(jumpNext){
                    $('.alert_next').first().click();
                } else {
                    $('#mission_alarm_btn').click();
                }
            } );
        });
    };


    initButtons();
    initKeys();
})();
