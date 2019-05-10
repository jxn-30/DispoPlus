// ==UserScript==
// @name         LS Heatmap
// @version      1.1
// @description  Skript zur Anzeige eines Heatmap-Overlays, zur Identifikation von Cold-Spots in der Abdeckung.
// @author       Jalibu
// @match        https://www.leitstellenspiel.de/*
// @grant        none
// @run          document-start
// ==/UserScript==

$('head').append('<script type="text/javascript" src="https://jalibu.github.io/DispoPlus/LSHeat/LSHeatScript.min.js"></script>');
