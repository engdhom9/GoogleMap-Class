console.log('GoogleMap Class, V-0.1.7')

class GoogleMap{
    #centerPosition
    #map
    #icons
    #vehiclesData
    #element

    constructor(element) {
        this.#centerPosition = this.point(24.7136,46.6753);
        this.#element = element
        this.setIcons()

        this.map()
    }

    setIcons() {
        this.#icons = {
            car : 'http://earth.google.com/images/kml-icons/track-directional/track-0.png',
            darkArrow : "http://maps.google.com/mapfiles/dir_walk_60.png",
            blueArrow : "http://maps.google.com/mapfiles/dir_60.png"
        }
    }

    setRadarData(vehiclesData) {
        this.#vehiclesData = vehiclesData
    }

    point(latitude,longitude) {
        return {
            lat: latitude,
            lng: longitude
        };
    }

    position(index,LatLng,icon) {
        return {
            position: LatLng,
            icon: icon,
            map: this.#map,
            label: index,
        }
    }

    map() {
        this.#map = new google.maps.Map(this.#element, {
            zoom: 11.15,
            center: this.#centerPosition,
        });
    }

    radar () {

        for(let i = 0; i < this.#vehiclesData.length ; i++) {
            new google.maps.Marker(
                this.position(
                    this.#vehiclesData[i]['plate'],
                    this.point(
                        this.#vehiclesData[i]['location']['lat'],
                        this.#vehiclesData[i]['location']['lng']
                    ),
                    this.#icons.car
                )
            );
        }
    }

    getAddress(geocoder,location,elemntsIDs) {
        geocoder.geocode( { 'location': location}, function(results, status) {
            if (status == 'OK') {
                $('#'+elemntsIDs.country).val('')
                $('#'+elemntsIDs.city).val('')
                $('#'+elemntsIDs.street).val('')
                $('#'+elemntsIDs.area).val('')
                $('#'+elemntsIDs.buildingNumber).val('')
                for(let i =0 ; i < 8 ; i ++) {

                    if(results[2]['address_components'][i] !== undefined &&
                        results[2]['address_components'][i]['types'][0] === 'country'){
                        $('#'+elemntsIDs.country).val(results[2]['address_components'][i]['long_name']);
                    }
                    if(results[2]['address_components'][i] !== undefined &&
                        results[2]['address_components'][i]['types'][0] === 'locality'){
                        $('#'+elemntsIDs.city).val(results[2]['address_components'][i]['long_name']);
                    }
                    if(results[2]['address_components'][i] !== undefined &&
                        results[2]['address_components'][i]['types'][0] === 'route'){
                        $('#'+elemntsIDs.street).val(results[2]['address_components'][i]['long_name']);
                    }
                    if(results[2]['address_components'][i] !== undefined &&
                        results[2]['address_components'][i]['types'][0] === 'political'){
                        $('#'+elemntsIDs.area).val(results[2]['address_components'][i]['long_name']);
                    }
                    if(results[2]['address_components'][i] !== undefined &&
                        results[2]['address_components'][i]['types'][0] === 'street_number'){
                        $('#'+elemntsIDs.buildingNumber).val(results[2]['address_components'][i]['long_name']);
                    }
                }
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    getLocation(inputElemnt,elemntsIDs,role) {
        let location
        let isDetermine = false
        let markLocation = NaN
        let geocoder = new google.maps.Geocoder()
        const input = inputElemnt
        const searchBox = new google.maps.places.SearchBox(input)

        this.#map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        // Bias the SearchBox results towards current map's viewport.
        this.#map.addListener("bounds_changed", () => {
            searchBox.setBounds(this.#map.getBounds());
        });

        let markers = [];

        searchBox.addListener("places_changed", () => {
            const places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }

            markers.forEach((marker) => {
                marker.setMap(null);
            });
            markers = [];

            const bounds = new google.maps.LatLngBounds();

            places.forEach((place) => {
                if (!place.geometry || !place.geometry.location) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                location = place.geometry.location
                if(isDetermine) {
                    markLocation.setMap(null)
                }
                isDetermine = true
                markLocation = new google.maps.Marker(
                    {
                        position: location,
                        icon: role === 'receiver' ? this.#icons.darkArrow : this.#icons.blueArrow,
                        map: this.#map,
                    }
                )
                this.getAddress(geocoder,location,elemntsIDs)

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            this.#map.fitBounds(bounds);
        });

        this.#map.addListener('click',(e)=>{

            location = e.latLng.toJSON();
            if(isDetermine) {
                markLocation.setMap(null)
            }
            isDetermine = true
            markLocation = new google.maps.Marker(
                this.position(
                    this.$map,
                    this.point(
                        location.lat,
                        location.lng,
                    ),
                    role === 'receiver' ? this.#icons.darkArrow : this.#icons.blueArrow
                )
            )
            $('#'+elemntsIDs.lat).val(location.lat)
            $('#'+elemntsIDs.lng).val(location.lng)

            this.getAddress(geocoder,location,elemntsIDs)

        })
    }

    mark(text,lat,lng) {
        new google.maps.Marker(this.position(text, this.point(lat, lng)));
    }
}
