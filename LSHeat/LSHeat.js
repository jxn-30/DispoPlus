// ==UserScript==
// @name         LS Heatmap
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Skript zur Anzeige eines Heatmap-Overlays, zur Identifikation von Cold-Spots in der Abdeckung.
// @author       Jalibu
// @match        https://www.leitstellenspiel.de/*
// @grant        none
// ==/UserScript==

var scriptElement = document.createElement("script");
scriptElement.type = "text/javascript";
scriptElement.src = "https://jalibu.github.io/LSHeat/LSHeat/LSHeatScript.js";
document.body.appendChild(scriptElement);