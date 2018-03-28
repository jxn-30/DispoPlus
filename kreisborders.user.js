// ==UserScript==
// @name         LSS Kreisgrenzen (DE only)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Fügt Kreisgrenzen auf der Karte ein.
// @author       Jalibu
// @match        https://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const STORAGE = 'LSS_KREISGRENZEN';

    $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'https://cdn.rawgit.com/patosai/tree-multiselect/v2.4.1/dist/jquery.tree-multiselect.min.css') );

    var myStyle = {
        "weight": 2,
        "fillOpacity": 0.05
    };

    let openBtn = '<div id="kreise-openBtn" class="leaflet-bar leaflet-control leaflet-control-custom map-expand-button" style="background-image: url(https://raw.githubusercontent.com/jalibu/LSHeat/master/icons8-germany-map-50.png); background-color: white; width: 26px; height: 26px;"></div>';
    $('.leaflet-bottom.leaflet-left').append(openBtn);

    $('#kreise-openBtn').click(function(){
        $('#kreise-modal').show();
    });

    $.getJSON( "https://raw.githubusercontent.com/jalibu/LSHeat/master/kreise.json", function( data ) {
        let response = [];
        let state;
        let bezirk;
        let kreis;

        let selected = JSON.parse(localStorage.getItem(STORAGE));

        let markup = '<div id="kreise-modal" style="display: none; z-index: 99999; background: #fff; top: 20px; position: absolute; width: 50%; left: 25%" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
        markup += '<div class="modal-header">';
        markup += '<button type="button" class="close kreise-close" data-dismiss="modal" aria-hidden="true">×</button>';
        markup += '<h3>Angezeigte Kreise</h3>';
        markup += '</div>';
        markup += '<div class="modal-body" style="overflow: scroll;">';

        markup += '<select id="kreise-selection" multiple="multiple">';
        for(let feature of data.features){
            if(!state || state !== feature.properties.NAME_1){
                state = feature.properties.NAME_1;
            }
            if(!bezirk || bezirk !== feature.properties.NAME_2){
                bezirk = feature.properties.NAME_2;
            }

            if(!kreis || kreis !== feature.properties.NAME_3){
                kreis = feature.properties.NAME_3;

            }
            if(selected && selected.indexOf('' + feature.id) >= 0){
                L.geoJSON(feature, {style: myStyle}).addTo(map);
                markup += '<option value="' + feature.id + '" selected="selected" data-section="' + state + '/' + bezirk + '">' + kreis + '</option>';
            } else {
                markup += '<option value="' + feature.id + '" data-section="' + state + '/' + bezirk + '">' + kreis + '</option>';
            }
        }
        markup += '</select>';
        markup += '</div>';
        markup += '<div class="modal-footer">';
        markup += '<button class="btn kreise-close" data-dismiss="modal" aria-hidden="true">Schließen</button>';
        markup += '<button id="kreise-btn-save" class="btn btn-primary">Speichern</button>';
        markup += '</div>';
        markup += '</div>';

        $('body').append(markup);
        $('.kreise-close').click(function(){
            $('#kreise-modal').hide();
        });

        $('#kreise-btn-save').click(function(){
            localStorage.setItem(STORAGE, JSON.stringify($('#kreise-selection').val()));
            location.reload();
        });

        $.getScript("https://cdn.rawgit.com/patosai/tree-multiselect/v2.4.1/dist/jquery.tree-multiselect.min.js", function(){
            $("#kreise-selection").treeMultiselect({searchable: true, startCollapsed: true});
            $('.tree-multiselect').css('background', '#fff');
        });
    });

})();
