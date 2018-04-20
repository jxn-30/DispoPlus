// ==UserScript==
// @name         ShareAlliancePost
// @namespace    Leitstellenspiel
// @version      2.3.1
// @author       jalibu, JuMaHo
// @include      https://www.leitstellenspiel.de/missions/*
// ==/UserScript==

(() => {
    'use strict';

    // Create Button and add event listener
    const initButtons = () => {
        const btnMarkup = '<a href="#" class="btn btn-success btn-sm alert_notify_alliance hidden-xs" title="Alarmieren, im Verband freigeben und Nachricht in Verbands-Chat"><img class="icon icons8-Phone-Filled" src="/images/icons8-phone_filled.svg" width="18" height="18"> <img class="icon icons8-Share" src="/images/icons8-share.svg" width="20" height="20"> <span class="glyphicon glyphicon-bullhorn" style="font-size: 13px;"></span></a>';
        $('.alert_next_alliance').parent().append(btnMarkup);
        $('.alert_notify_alliance').click(processAllianceShare);
    };

    const processAllianceShare = () => {
        const message = 'Frei zum Mitverdienen!';
        const sendToAlliance = 1;
        const missionShareLink = $('#mission_alliance_share_btn').attr('href');
        const missionId = missionShareLink.replace('/missions/','').replace('/alliance', '');
        const csrfToken = $('meta[name="csrf-token"]').attr('content');

        $('.alert_notify_alliance').html('Teilen..');
        $.get('/missions/' + missionId + '/alliance' , () => {
            $('.alert_notify_alliance').html('Chatten..');
            $.post( "/mission_replies", {authenticity_token: csrfToken, mission_reply: {alliance_chat: sendToAlliance, content: message, mission_id: missionId}}, (data, status, xhr) => {
                $('.alert_notify_alliance').html('Alarmieren..');
                $('#mission_alarm_btn').click();
            } );
        });
    };
    initButtons();
})();
