// ==UserScript==
// @name         LSS Kreisgrenzen (DE only)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fügt Kreisgrenzen auf der Karte ein.
// @author       Jalibu
// @match        https://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
        var myStyle = {
        "weight": 2,
        "fillOpacity": 0.05
    };

    $.getJSON( "https://raw.githubusercontent.com/jalibu/LSHeat/master/kreise.json", function( data ) {

L.geoJSON(data, {style: myStyle}).addTo(map);
    });
})();
