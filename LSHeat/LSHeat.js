// ==UserScript==
// @name         LS Heatmap
// @version      1.0
// @description  Skript zur Anzeige eines Heatmap-Overlays, zur Identifikation von Cold-Spots in der Abdeckung.
// @author       Jalibu
// @match        https://www.leitstellenspiel.de/*
// @grant        none
// @run          document-start
// ==/UserScript==

$('head').append('<script type="text/javascript" src="https://raw.githubusercontent.com/jalibu/DispoPlus/master/LSHeat/LSHeatScript.min.js"></script>');
