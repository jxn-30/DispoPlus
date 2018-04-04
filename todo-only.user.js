// ==UserScript==
// @name         ToDo-Missions only
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Filtert die Einsatzliste so, dass nur Einsätze angezeigt werden, bei denen noch was zu tun ist.
// @author       Jalibu
// @match        https://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let clearMissions = function(){
        $('#mission_list > div').each(function(){
            let panel = $(this).find('div.panel');
            if(panel.attr('class') && panel.attr('class').indexOf('green') >= 0){
                $(this).hide();
            }
        });

        $('#mission_list_alliance, #mission_list_sicherheitswache > div').each(function(){
            let panel = $(this).find('div.panel');
            if(panel.attr('class') && panel.attr('class').indexOf('green') >= 0){
                console.log($(this).find('span.glyphicon-user:visible').length);
                if($(this).find('span.glyphicon-user:visible').length > 0){
                    $(this).hide();
                }
            }
        });

    };

    clearMissions();

    let missionMarkerAddOrig = missionMarkerAdd;

    missionMarkerAdd = function(data){
        clearMissions();
        missionMarkerAddOrig(data);
    };


})();
