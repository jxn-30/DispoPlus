// ==UserScript==
// @name         ShareAlliancePost
// @namespace    Leitstellenspiel
// @version      2.1
// @author       jalibu, JuMaHo
// @include      https://www.leitstellenspiel.de/missions/*
// ==/UserScript==

(() => {
    'use strict';

    let initButtons = () => {
        let btnMarkup = '<a href="#" class="btn btn-success btn-sm alert_notify_alliance hidden-xs" title="Alarmieren, im Verband freigeben und Nachricht in Verbands-Chat"><img class="icon icons8-Phone-Filled" src="/images/icons8-phone_filled.svg" width="18" height="18"> <img class="icon icons8-Share" src="/images/icons8-share.svg" width="20" height="20"> <span class="glyphicon glyphicon-bullhorn" style="font-size: 13px;"></span></a>';
        $('.alert_next_alliance').parent().append(btnMarkup);
        $('.alert_notify_alliance').click(() => {
            processAllianceShare();
        });
    };

    let processAllianceShare = () => {
        let message = 'frei zum sammeln!';
        let sendToAlliance = 1;
        let missionShareLink = $('#mission_alliance_share_btn').attr('href');
        let missionId = missionShareLink.replace('/missions/','').replace('/alliance', '');
        let csrfToken = $('meta[name="csrf-token"]').attr('content');
        console.log('Share mission #' + missionId);
        $('.alert_notify_alliance').html('Teilen..');
        $.get('/missions/' + missionId + '/alliance' , () => {
            $('.alert_notify_alliance').html('Chatten..');
            console.log('Mission is shared... Now post message to chat...');
            $.post( "/mission_replies", {authenticity_token: csrfToken, mission_reply: {alliance_chat: sendToAlliance, content: message, mission_id: missionId}}, (data, status, xhr) => {
                console.log('Message posted... Reloading...');
                $('.alert_notify_alliance').html('Laden..');
                location.reload();
            } );
        });
    };
    initButtons();
})();
