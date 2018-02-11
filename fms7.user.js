// ==UserScript==
// @name         Show FMS 7 target
// @namespace    http://tampermonkey.net/
// @version      1.8.2
// @description  Shows the FMS 7 target (Hospital) by hovering a vehicle
// @author       Jalibu
// @match        https://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==
(() => {

    // Should FMS 7 locations be initialy set on page load?
    // Set to true or false
    // Warning: This option is beta and could cause a much longer page load when set to true.
    const ENABLE_INITIAL_STATUS = true;

    // Prepare hint area
    const fms7target = $('<div id="fms7target" style="display:none; z-index: 999999; max-width: 260px; padding: 8px; background-color:#f58558">');
    $('body').append(fms7target);

    $('.building_list_vehicle_element').hover(function() {
        if($(this).attr('data-target-hospital')){
            fms7target.html('Unterwegs zu ' + $(this).attr('data-target-hospital') + ' (' + $(this).attr('data-target-hospital-distance') + ' km)');
            const buttonPosition = $(this).offset();
            fms7target.css({
                top: buttonPosition.top + 30,
                left: buttonPosition.left,
                position: 'absolute'
            }).show();
        }
        $(this).mouseleave(() => {
            fms7target.hide();
        });
    });

    // Override vehicleDrive function with custom behaviour
    let vehicleDriveOrig = vehicleDrive;
    vehicleDrive = (data) => {
        try {
            // Exclude FuStW && GefKW
            let isPoliceVehicle = data.vtid && (data.vtid == 32 || data.vtid == 52);

            if(data.fms_real === 7 && data.s == -1 && !isPoliceVehicle){
                // The route could be empty (data.s: '-1'). In this case the route comes in a few seconds in a async route request. Let's set it to UNKNOWN for a moment...
                $('li[vehicle_id = ' + data.id + ']').attr('data-target-hospital', 'UNKNOWN');
            } else if(data.fms_real === 7 && data.s != -1  && !isPoliceVehicle){
                // On FMS 7 identify target and store it as data attribute to the vehicle...
                let route = JSON.parse(data.s);
                let hospital_position = route[route.length -1];
                let hospital_lat = hospital_position[0];
                let hospital_long = hospital_position[1];

                // As the targets might not match 100% we have to estimate the nearest possible hospital
                let targetHospital = findNearestHospital(hospital_lat,hospital_long);

                // Is this the second call for an unknown route?
                let wasUnknown = $('li[vehicle_id = ' + data.id + ']').attr('data-target-hospital') === 'UNKNOWN';

                if(targetHospital){
                    $('li[vehicle_id = ' + data.id + ']').attr('data-target-hospital', targetHospital.name);
                } else {
                    $('li[vehicle_id = ' + data.id + ']').attr('data-target-hospital', 'VB-KH');
                }

                let hospitalDistance = getTotalDistanceInKm(route).toFixed(2);
                $('li[vehicle_id = ' + data.id + ']').attr('data-target-hospital-distance', hospitalDistance);

                if(wasUnknown){
                    radioMessage(
                        {"mission_id":0,
                         "additionalText":"",
                         "user_id":user_id,
                         "type":"vehicle_fms",
                         "id":data.id,
                         "fms_real":7,
                         "fms":7,
                         "fms_text":"Patient aufgenommen",
                         "caption":data.caption
                        }
                    );
                }

            } else if(data.fms_real === 1){
                // On FMS 1 delete target information
                $('li[vehicle_id = ' + data.id + ']').attr('data-target-hospital-last', $('li[vehicle_id = ' + data.id + ']').attr('data-target-hospital'));
                $('li[vehicle_id = ' + data.id + ']').removeAttr('data-target-hospital');
                $('li[vehicle_id = ' + data.id + ']').removeAttr('data-target-hospital-distance');
            }
        } catch(e){
            console.log('There was an error processing the vehicleDrive() custom function: '+ e);
        } finally {
            // Execute original function
            vehicleDriveOrig(data);
        }
    };

    // Override radioMessage function with custom behaviour
    let radioMessageOrig = radioMessage;
    radioMessage = (data) => {
        try{
            if(data.fms_real === 7){
                let vehicle = $('li[vehicle_id = ' + data.id + ']');
                let target = vehicle.attr('data-target-hospital');
                if(target && target === 'VB-KH'){
                    data.fms_text = data.fms_text + ' => Verbands KH (' + vehicle.attr('data-target-hospital-distance') + ' km)';
                } else if(target){
                    data.fms_text = data.fms_text + ' => ' + target;
                }
            } else if(data.fms_real === 1){
                let vehicle = $('li[vehicle_id = ' + data.id + ']');
                let lastTarget = vehicle.attr('data-target-hospital-last');
                if(lastTarget){
                    data.fms_text = 'Frei in ' + lastTarget;
                }
            }
        } catch(e){
            console.log('There was an error processing the radioMessage() custom function: '+ e);
        } finally{
            // Execute original function
            radioMessageOrig(data);
        }
    };

    // Retrieve all hospitals from list
    let getHospitals = () => {
        let hospitals = [];
        $('#building_list > li[building_type_id=4]').each(function(){
            let hospital = $(this).find('.map_position_mover');
            hospitals.push({
                name: hospital.text(),
                lat: hospital.attr('data-latitude'),
                long: hospital.attr('data-longitude'),
                id: hospital.parent().find('img').attr('building_id')
            });

        });
        return hospitals;
    };

    let findNearestHospital = (lat, long) => {
        let hospitals = getHospitals();
        let shortestDistance;
        let shortestHospital;
        for(let hospital of hospitals){
            let distance = getDistanceFromLatLonInKm(hospital.lat, hospital.long, lat, long);
            if(!shortestDistance || distance < shortestDistance){
                shortestDistance = distance;
                shortestHospital = hospital;
            } else if(distance === 0){
                return hospital;
            }
        }
        if(shortestDistance > 0.5){
            return null;
        } else {
            return shortestHospital;
        }
    };

    let getDistanceFromLatLonInKm = (lat1,lon1,lat2,lon2) => {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
    };

    let getTotalDistanceInKm = (route) => {
        let totalDistance = 0;
        for (let i = 0; i < route.length - 1; i++){
            totalDistance = totalDistance + getDistanceFromLatLonInKm(route[i][0], route[i][1], route[i+1][0], route[i+1][1]);
        }
        return totalDistance;
    };

    let deg2rad = (deg) => {
        return deg * (Math.PI/180);
    };

    if(ENABLE_INITIAL_STATUS){
        try{
            let scriptBlocks = $('#container-fluid-application-template > script');
            for(let i = 0; i < scriptBlocks.length; i++){
                let script = $(scriptBlocks[i]).html();
                if(script.indexOf('vehicleDrive(') > 0){
                    var res = script.match(/vehicleDrive\((.*)?\);/g);
                    for (let match of res){
                        if(match.indexOf('"fms_real":7') > 0){
                            let dataObject = JSON.parse(match.substring(match.indexOf('(') + 1, match.length - 2));
                            if(dataObject.user_id === user_id){
                                vehicleDrive(dataObject);
                            }
                        }
                    }
                }
            }
        } catch(e){
            console.log('There was an error retrieving the initial status: ' + e);
        }
    }

})();
