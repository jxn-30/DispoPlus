(function(I18n, $) {
    'use strict';
    
    var LS_HEATMAP_STORAGE = "LS_HEATMAP_STORAGE";
    var SCRIPT_URL = "https://jalibu.github.io/DispoPlus/LSHeat/";
    
    I18n.translations.de['lssm'] = I18n.translations.de['lssm'] || {};
    I18n.translations.en['lssm'] = I18n.translations.en['lssm'] || {};
    
    I18n.translations.de['lssm']['heatmap'] = {
            loeschfz: "Löschfahrzeuge",
            tankloeschfz: "Tanklöschfahrzeuge",
            schlauchwg: "Schlauchwagen",
            ruest: "Rüstwagen",
            oel: "Öl",
            dekon: "Dekon-P",
            atem: "Atemschutz",
            elw: "ELW 1+2",
            radius: "Radius",
            activated: "Aktiviert",
            intensity: "Intensität",
            vehicleType: "Fahrzeug-Typ",
            reset: "Zurücksetzen",
            close: "Schließen"
    };
    
    I18n.translations.en['lssm']['heatmap'] = {
            loeschfz: "Fire Trucks",
            tankloeschfz: "Tank Fire Trucks",
            schlauchwg: "Watercar",
            ruest: "Supply Truck",
            oel: "Oil",
            dekon: "Decon-P",
            atem: "Respiratory",
            elw: "ELW 1+2",
            radius: "Radius",
            activated: "Activated",
            intensity: "Intensity",
            vehicleType: "Vehicle type",
            reset: "Reset",
            close: "Close"
    };

    $('head').append('<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>');
    $('head').append('<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"></script>');

    $('head').append('<script type="text/javascript" src="' + SCRIPT_URL + '/vendor/leaflet-heat.js"></script>');

    var vehicleClasses = {
        '1000': {'name': '[' + I18n.t('lssm.heatmap.loeschfz') + ']', 'vehicleTypeIds': [0, 1,6,7,8,9,30,37]},
        '1001': {'name': '[' + I18n.t('lssm.heatmap.tankloeschfz') + ']', 'vehicleTypeIds': [17,18,19,20,21,22,23,24,25,26]},
        '1002': {'name': '[' + I18n.t('lssm.heatmap.schlauchwg') + ']', 'vehicleTypeIds': [11,13,14,15,16]},
        '1003': {'name': '[' + I18n.t('lssm.heatmap.ruest') + ']', 'vehicleTypeIds': [4,30,47]},
        '1004': {'name': '[' + I18n.t('lssm.heatmap.oel') + ']', 'vehicleTypeIds': [10,49]},
        '1005': {'name': '[' + I18n.t('lssm.heatmap.dekon') + ']', 'vehicleTypeIds': [53,54]},
        '1006': {'name': '[' + I18n.t('lssm.heatmap.atem') + ']', 'vehicleTypeIds': [5,48]},
        '1007': {'name': '[' + I18n.t('lssm.heatmap.elw') + ']', 'vehicleTypeIds': [3,34]}
    };

    function getSettings(){
        var settings = {
            'heatmap-activated': {'name': I18n.t('lssm.heatmap.activated'), 'type': 'boolean', 'default': false},
            'heatmap-radius': {'name': I18n.t('lssm.heatmap.radius'), 'type': 'range', 'default': '80'},
            'heatmap-intensity': {'name': I18n.t('lssm.heatmap.intensity'), 'type': 'range', 'default': '15'},
            'heatmap-vehicle': {'name': I18n.t('lssm.heatmap.vehicleType'), 'type': 'select', 'default': '1000'}
        };

        if (!window.localStorage.getItem(LS_HEATMAP_STORAGE)) {
            for (var key in settings) {
                settings[key].value = settings[key].default;
            }
        } else {
            settings = JSON.parse(window.localStorage.getItem(LS_HEATMAP_STORAGE));
        }
        return settings;
    }

    function getSetting(name){
        var settings = getSettings();
        return settings[name].value;
    }

    function setSettings(reload){
        var settings = getSettings();
        for (var key in settings) {
            var formElement = $('#' + key);
            if(settings[key].type == 'boolean'){
                if (formElement.is(':checked')) {
                    settings[key].value = true;
                } else {
                    settings[key].value = false;
                }
            } else if(settings[key].type == 'range'){
                settings[key].value = formElement.slider("value");
            } else{
                settings[key].value = parseInt(formElement.val());
            }
        }

        window.localStorage.removeItem(LS_HEATMAP_STORAGE);
        window.localStorage.setItem(LS_HEATMAP_STORAGE, JSON.stringify(settings));

        if(reload) parent.location.reload();
    }

    $( window ).load(function() {
        if (window.top != window.self){
            // Nothing to do here yet.
        } else {
            handleMainWindow();
        }
    });

    function handleMainWindow(){
        renderMap();
        renderMapSettings();
    }

    function renderMapSettings(){
        $('.leaflet-control-container .leaflet-bottom.leaflet-left').append('<div id="ls-heatmap-config-wrapper" class="leaflet-bar leaflet-control" style="background-color: white;"><img id="ls-heatmap-config-img" style="height: 32px; width: 32px; cursor: pointer;" src="' + SCRIPT_URL +'/images/ls-heat-layer.png"></div>');
        $('#ls-heatmap-config-img').on('click', function(){
            var wrapper = $('#ls-heatmap-config-wrapper');
            var isOpened = $(wrapper).attr('data-opened') == 'true';
            if(isOpened){
                $('#ls-heatmap-config').remove();
                $(wrapper).attr('data-opened', 'false');
            } else {
                var mapConfig = '<div id="ls-heatmap-config"><table style="line-height: 30px; margin-left: 30px; margin-bottom: 10px; margin-right: 10px;" class="ls-form-group"></table>';
                $('#ls-heatmap-config-wrapper').append(mapConfig);
                $(wrapper).attr('data-opened', 'true');

                // Aktiviert
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td>Aktiviert</td><td><input class="ls-input" type="checkbox" id="heatmap-activated"></td></tr>');
                if(getSetting('heatmap-activated')){
                    $('#heatmap-activated').attr('checked', 'checked');
                }
                
                // Vehicle
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td>Fahrzeug</td><td><select class="ls-input" id="heatmap-vehicle"></select></td></tr>');

                for(var key in vehicleClasses){
                    if(getSetting('heatmap-vehicle') == this){
                        $('#heatmap-vehicle').append('<option selected value="'+ key + '">' + vehicleClasses[key].name + '</option>');
                    } else {
                        $('#heatmap-vehicle').append('<option value="'+ key + '">' + vehicleClasses[key].name + '</option>');
                    }
                }

                $(availableVehicleTypes).each(function(){
                    if(getSetting('heatmap-vehicle') == this){
                        $('#heatmap-vehicle').append('<option selected value="'+ this + '">' + carsById[this][0] + '</option>');
                    } else {
                        $('#heatmap-vehicle').append('<option value="'+ this + '">' + carsById[this][0] + '</option>');
                    }
                });

                // Radius
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td>Radius</td><td><div class="value-slider" data-min="0" data-max="200" data-value="'+ getSetting('heatmap-radius') +'" id="heatmap-radius"></div></td></tr>');

                // Intensity
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td>Intensität</td><td><div class="value-slider" data-min="0" data-max="20" data-value="'+ getSetting('heatmap-intensity') +'" id="heatmap-intensity"></div></td></tr>');


                $('#ls-heatmap-config .ls-input').on('change', function () {
                    setSettings();
                    renderMap();
                });

                $('.value-slider').slider({
                    start: function(){
                        map.dragging.disable();
                    },
                    stop: function(){
                        map.dragging.enable();
                    },
                    create: function(event, ui) {
                        $(this).slider('option', 'max', $(this).data('max'));
                        $(this).slider('option', 'value', $(this).data('value'));
                    },
                    slide: function() {
                        setSettings();
                        renderMap();
                    },
                    min: 1
                });

                // Buttons
                $('#ls-heatmap-config .ls-form-group').append('<tr class="ls-heatmap-option"><td><button id="heatmap_close" class="btn btn-default btn-xs">' + I18n.t('lssm.heatmap.close') + '</button><td><button id="heatmap_reset" class="btn btn-default btn-xs">' + I18n.t('lssm.heatmap.reset') + '</button></td></td></tr>');

                $('#heatmap_reset').click(function () {
                    window.localStorage.removeItem(LS_HEATMAP_STORAGE);
                    renderMap();
                    $('#ls-heatmap-config-img').click();
                    $('#ls-heatmap-config-img').click();
                });

                $('#heatmap_close').click(function () {
                    $('#ls-heatmap-config-img').click();
                });
            }

        });
    }
    var availableVehicleTypes = [];
    function getVehicles(){
        var vehicles = [];
        $('#building_list .building_list_li').each(function(){
            var building = $(this);
            var long = $(building).find('.map_position_mover').attr('data-longitude');
            var lat = $(building).find('.map_position_mover').attr('data-latitude');
            $(this).find('.building_list_vehicle_element').each(function(){
                var vehicle_type_id = $(this).find('.vehicle_building_list_button').attr('vehicle_type_id');
                var name = $(this).find('.vehicle_building_list_button').text();
                var vehicle = {'vehicle_type_id': parseInt(vehicle_type_id), 'lat': lat, 'long': long, 'name': name};
                vehicles.push(vehicle);
                if (availableVehicleTypes.indexOf(vehicle_type_id) === -1) availableVehicleTypes.push(vehicle_type_id);
            });
        });
        return vehicles;
    }

    var heat;

    var vehicles;
    function renderMap(){
        if (heat !== undefined) {
            map.removeLayer(heat);
            heat = undefined;
        }

        if(vehicles === undefined){
            vehicles = getVehicles();
        }

        if(getSetting('heatmap-activated')){

            var entries = [];
            $(vehicles).each(function(){
                var vehicle = this;
                if(vehicle.vehicle_type_id == getSetting('heatmap-vehicle')){
                    entries.push([vehicle.lat, vehicle.long, getSetting('heatmap-intensity')]);
                } else if(vehicleClasses[getSetting('heatmap-vehicle')] !== undefined && vehicleClasses[getSetting('heatmap-vehicle')].vehicleTypeIds.indexOf(vehicle.vehicle_type_id ) !== -1){
                    entries.push([vehicle.lat, vehicle.long, getSetting('heatmap-intensity')]);
                }
            });
            heat = L.heatLayer(entries, {radius: getSetting('heatmap-radius')}).addTo(map);
        }
    }
    var carsById = {
    	    "0": ["LF 20", 0],
    	    "1": ["LF 10", 0],
    	    "2": ["DLK 23", 0],
    	    "3": ["ELW 1", 0],
    	    "4": ["RW", 0],
    	    "5": ["GW-A", 0],
    	    "6": ["LF 8/6", 0],
    	    "7": ["LF 20/16", 0],
    	    "8": ["LF 10/6", 0],
    	    "9": ["LF 16-TS", 0],
    	    "10": ["GW-Öl", 0],
    	    "11": ["GW-L2-Wasser", 0],
    	    "12": ["GW-Messtechnik", 0],
    	    "13": ["SW 1000", 0],
    	    "14": ["SW 2000", 0],
    	    "15": ["SW 2000-Tr", 0],
    	    "16": ["SW Kats", 0],
    	    "17": ["TLF 2000", 0],
    	    "18": ["TLF 3000", 0],
    	    "19": ["TLF 8/18", 0],
    	    "20": ["TLF 8/18", 0],
    	    "21": ["TLF 16/24-Tr", 0],
    	    "22": ["TLF 16/25", 0],
    	    "23": ["TLF 16/45", 0],
    	    "24": ["TLF 20/40", 0],
    	    "25": ["TLF 20/40-SL", 0],
    	    "26": ["TLF 16", 0],
    	    "27": ["GW-Gefahrgut", 0],
    	    "28": ["RTW", 1],
    	    "29": ["NEF", 1],
    	    "30": ["HLF 20", 0],
    	    "31": ["RTH", 1],
    	    "32": ["FuStW", 2],
    	    "33": ["GW-Höhenrettung", 0],
    	    "34": ["ELW 2", 0],
    	    "35": ["leBefKw", 2],
    	    "36": ["MTW", 0],
    	    "37": ["TSF-W", 0],
    	    "38": ["KTW", 1],
    	    "39": ["GKW", 3],
    	    "40": ["MTW-TZ", 3],
    	    "41": ["MzKW", 3],
    	    "42": ["LKW K 9", 3],
    	    "43": ["BRmG R", 3],
    	    "44": ["Anh DLE", 3],
    	    "45": ["MLW 5", 3],
    	    "46": ["WLF", 0],
    	    "47": ["AB-Rüst", 0],
    	    "48": ["AB-Atemschutz", 0],
    	    "49": ["AB-Öl", 0],
    	    "50": ["GruKw", 2],
    	    "51": ["FüKw", 2],
    	    "52": ["GefKw", 2],
    	    "53": ["Dekon-P", 0],
    	    "54": ["AB-Dekon-P", 0],
    	    "55": ["KdoW-LNA", 1],
    	    "56": ["KdoW-Orgl", 1],
    	    "57": ["FwK", 0],
    	    "58": ["KTW Typ B", 1],
    	    "59": ["ELW 1 (SEG)", 1],
    	    "60": ["GW-San", 1],
    	    "61": ["Polizeihubschrauber", 2],
    	    "62": ["AB-Schlauch", 0],
    	    "63": ["GW-Taucher", 4],
    	    "64": ["GW-Wasserrettung", 4],
    	    "65": ["LKW 7 Lkr 19 tm", 4],
    	    "66": ["Anh MzB", 4],
    	    "67": ["Anh SchlB", 4],
    	    "68": ["Anh MzAB", 4],
    	    "69": ["Tauchkraftwagen", 4],
    	    "70": ["MZB", 4],
    	    "71": ["AB-MZB", 4],
    	};
})(I18n, jQuery);
