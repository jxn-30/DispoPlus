// ==UserScript==
// @name         LS Heatmap
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Skript zur Anzeige eines Heatmap-Overlays, zur Identifikation von Cold-Spots in der Abdeckung.
// @author       Jalibu
// @match        https://www.leitstellenspiel.de/*
// @grant        none
// ==/UserScript==

var carIds = {
    0: 'LF 20',
    1: 'LF 10',
    2: 'DLK 23',
    3: 'ELW 1',
    4: 'RW',
    5: 'GW-A',
    6: 'LF 8/6',
    7: 'LF 20/16',
    8: 'LF 10/6',
    9: 'LF 16-TS',
    10: 'GW-Öl',
    11: 'GW-L2-Wasser',
    12: 'GW-Messtechnik',
    13: 'SW 1000',
    14: 'SW 2000',
    15: 'SW 2000-Tr',
    16: 'SW KatS',
    17: 'TLF 2000',
    18: 'TLF 3000',
    19: 'TLF 8/8',
    20: 'TLF 8/18',
    21: 'TLF 16/24-Tr',
    22: 'TLF 16/25',
    23: 'TLF 16/45',
    24: 'TLF 20/40',
    25: 'TLF 20/40-SL',
    26: 'TLF 16',
    27: 'GW-Gefahrgut',
    28: 'RTW',
    29: 'NEF',
    30: 'HLF 20',
    31: 'RTH',
    32: 'FuStW',
    33: 'GW-Höhenrettung',
    34: 'ELW 2',
    35: 'leBefKw',
    36: 'MTW',
    37: 'TSF-W',
    38: 'KTW',
    39: 'GKW',
    40: 'MTW-TZ',
    41: 'MzKW',
    42: 'LKW K9',
    43: 'BRmG R',
    44: 'Anh. DLE',
    45: 'MLW 5',
    46: 'WLF',
    47: 'AB-Rüst',
    48: 'AB-Atemschutz',
    49: 'AB-Öl',
    50: 'GruKw',
    51: 'FüKw',
    52: 'GefKw',
    53: 'GW Dekon-P',
    54: 'AB-Dekon-P',
    55: 'KdoW-LNA',
    56: 'KdoW-OrgL',
    57: 'Kran',
    58: 'KTW Typ B',
    59: 'ELW 1 (SEG)',
    60: 'GW-SAN',
    61: 'Polizeihubschrauber',
    62: 'AB-Schlauch',
    63: 'GW-Taucher',
    64: 'GW-Wasserrettung',
    65: 'LKW 7 Lkr 19 tm',
    66: 'Anh MzB',
    67: 'Anh SchlB',
    68: 'Anh MzAB',
    69: 'Tauchkraftwagen',
    70: 'MZB',
    71: 'AB-MZB'
};


var heatmapSettingOptions = {
    'heatmap-activated': {'name': 'Aktiviert', 'type': 'boolean', 'default': false},
    'heatmap-radius': {'name': 'Radius', 'type': 'range', 'default': '80'},
    'heatmap-intensity': {'name': 'Intensität', 'type': 'range', 'default': '15'},
    'heatmap-vehicle': {'name': 'Fahrzeug-Typ', 'type': 'select', 'default': '0'}
};

var heatmapSettings = {};
if (!window.localStorage.getItem('lst_heatmap_settings')) {
    for (var key in heatmapSettingOptions) {
        heatmapSettings[key] = heatmapSettingOptions[key].default;
    }
} else {
    heatmapSettings = JSON.parse(window.localStorage.getItem('lst_heatmap_settings'));
}

function saveHeatmapSettings(){
    var key;
    for (key in heatmapSettingOptions) {
        var formElement = $('#' + key);
        if(heatmapSettingOptions[key].type == 'boolean'){
            if (formElement.is(':checked')) {
                heatmapSettings[key] = true;
            } else {
                heatmapSettings[key] = false;
            }
        } else{
            heatmapSettings[key] = parseInt(formElement.val());
        }
    }

    window.localStorage.removeItem('lst_heatmap_settings');
    window.localStorage.setItem('lst_heatmap_settings', JSON.stringify(heatmapSettings));

    parent.location.reload();
}

var vehicles = [];
function handleMainWindow() {

    if(heatmapSettings['heatmap-activated']){
        var scriptElement = document.createElement( "script" );
        scriptElement.type = "text/javascript";
        scriptElement.src = "https://jalibu.github.io/LSHeat/LSHeat/leaflet-heat.js";
        document.body.appendChild( scriptElement );

        $('#building_list .building_list_li').each(function(){
            var building = $(this);
            var long = $(building).find('.map_position_mover').attr('data-longitude');
            var lat = $(building).find('.map_position_mover').attr('data-latitude');
            $(this).find('.building_list_vehicle_element').each(function(){
                var vehicle_type_id = $(this).find('.vehicle_building_list_button').attr('vehicle_type_id');
                var name = $(this).find('.vehicle_building_list_button').text();
                var vehicle = {'vehicle_type_id': vehicle_type_id, 'lat': lat, 'long': long, 'name': name};
                vehicles.push(vehicle);
            });
        });

        $( window ).load(function() {
          var entries = [];
          $(vehicles).each(function(){
            var vehicle = this;
            if(vehicle.vehicle_type_id == heatmapSettings['heatmap-vehicle']){
                entries.push([vehicle.lat, vehicle.long, heatmapSettings['heatmap-intensity']]);
            }
        });
          var heat = L.heatLayer(entries, {radius: heatmapSettings['heatmap-radius']}).addTo(map);
      });
    }

    'use strict';

    $( window ).load(function() {
      $('.leaflet-control-container .leaflet-top.leaflet-left').append('<a href="/leitstelle#tab_settings" id="heatmap-config" class="leaflet-bar leaflet-control leaflet-control-custom hidden-xs lightbox-open" style="background-color: white; width: 26px; height: 26px;">HM</a>');
  });
}

function handleIframeWindow(){
        var navTabs = $('#iframe-inside-container .nav-tabs');
    if($(navTabs).text().indexOf('Einstellungen') > 0){
        $(navTabs).append('<li role="presentation"><a data-toggle="tab" role="tab" aria-controls="tab_heatmap" href="#tab_heatmap" aria-expanded="false">Heatmap</a></li>');
        if(window.location.hash === '#tab_settings') {
            renderSettings();
            $("a[href='#tab_heatmap']").click();
        }
    }
}

if (window.top != window.self){
    handleIframeWindow();

} else {
   handleMainWindow();
}

function renderSettings() {

    $('.tab-content').append('<div id="tab_heatmap" class="tab-pane active" role="tabpanel"></div>');
    $('#tab_heatmap').append('<div class="form-horizontal" id="tab_heatmap_col"></div>');
    
    var markupBefore = '<div class="form-group"><div class="col-sm-3"></div><div class="col-sm-9">';
    var markupAfter = '</div></div>';
    
    // Aktiviert
    $('#tab_heatmap_col').append(markupBefore + '<label for="heatmap-activated" class="checkbox"><input type="checkbox" id="heatmap-activated">Aktiviert</label>' + markupAfter);
    if(heatmapSettings['heatmap-activated']){
        $('#heatmap-activated').attr('checked', 'checked');
    }
    
    // Radius
    $('#tab_heatmap_col').append(markupBefore + '<label for="heatmap-radius" class="input"><input type="text" value="' + heatmapSettings['heatmap-radius'] + '" id="heatmap-radius">Radius</label>' + markupAfter);

    // Intensity
    $('#tab_heatmap_col').append(markupBefore + '<label for="heatmap-intensity" class="input"><input type="text" value="' + heatmapSettings['heatmap-intensity'] + '" id="heatmap-intensity">Intensität</label>' + markupAfter);

    // Vehicle
    $('#tab_heatmap_col').append(markupBefore + '<label for="heatmap-intensity" class="input"><select id="heatmap-vehicle"></select>Fahrzeug</label>' + markupAfter);
    for (var key in carIds) {
        if(heatmapSettings['heatmap-vehicle'] == key){
            $('#heatmap-vehicle').append('<option selected value="'+ key + '">' + carIds[key] + '</option>');
        } else {
            $('#heatmap-vehicle').append('<option value="'+ key + '">' + carIds[key] + '</option>');
        }
        
    }

    // Button
    $('#tab_heatmap_col').append(markupBefore + '<button id="heatmap_save" class="btn btn-success">Speichern</button>' + markupAfter);

    $('#heatmap_save').click(function () {
        saveHeatmapSettings();
    });
}