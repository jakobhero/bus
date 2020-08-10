import React, { useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from "@reach/combobox";
import axios from "axios";
import "@reach/combobox/styles.css";
import "../css/search.css";

import routes from "./routesInfo";

const PlacesAutocomplete = ({
  id,
  handleChange,
  placeholder,
  route,
  searchVal,
  setSearchVal,
}) => {
  const [stopData, setStopData] = useState([]);
  const [routeData, setRouteData] = useState([]);

  const [input, setInput] = useState(false);
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
  } = usePlacesAutocomplete({
    requestOptions: {
      // set google places to only return places in Ireland, favouring places close to Dublin
      location: new window.google.maps.LatLng(53.35014, -6.266155),
      radius: 10000, //100 km
      componentRestrictions: { country: "ie" },
      strictBounds: true, // doesnt work with current version of package, will be left for future work
    },
  });
  function searchLocalStop(query) {
    axios
      .get("/api/stops?substring=" + query)
      .then((res) => {
        if (res.statusText === "OK") {
          setStopData(res.data.stops);
        }
      })
      .catch(console.log);
  }

  function searchLocalRoute(query) {
    // search locally stored array of bus routes
    var filter,
      count,
      route_id,
      key,
      route_data = [];
    filter = query.toUpperCase();
    count = 0;

    if (filter.length !== 0) {
      for (var i = 0; i < routes.length; i++) {
        route_id = routes[i].toUpperCase();
        // If entered letters are the prefix for the name of the station enter conditional
        if (route_id.includes(filter)) {
          key = route_id + count;
          route_data.push({ route_id: route_id, key: key });
          count += 1;
        }
        if (count > 2) {
          break;
        }
      }
      setRouteData(route_data);
    }
  }

  const handleInput = (e) => {
    setInput(true);
    // when characters are added to the input, then functions are run with the input, if there is a match then add that match to the array, the array is displayed in the dropdown
    try {
      setRouteData([]);
      setStopData([]);
      searchLocalStop(e.target.value);
      if (route) {
        // only search routes if specified
        searchLocalRoute(e.target.value);
      }
      setValue(e.target.value);
      setSearchVal(e.target.value);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (val) => {
    //Firstly if the option was a bus stop, then find the corresponding info for the stop and send the data to the parent via handleChange.
    //Then if it was a route, send bus_id to parent
    // Lastly if it was a place, find the co ords, then send them along with value to parent
    let lat, lng, stopID, fullname, lines;
    setInput(false);

    if (val.includes(", Bus Stop")) {
      stopID = val.split("(")[1];
      stopID = stopID.split(")")[0];
      for (var i = 0; i < stopData.length; i++) {
        // loop over the data orginally fetched from the server during the lookup
        let stop_id = stopData[i].stop_id;
        if (stop_id === stopID) {
          lat = stopData[i].lat;
          lng = stopData[i].lng;
          fullname = stopData[i].fullname;
          lines = stopData[i].lines;
          handleChange({ stopID, lat, lng, fullname, lines }, id);
          setSearchVal(val, false);
        }
      }
    } else if (val.includes(", Bus Route")) {
      const bus_id = val.slice(0, val.length - 11);
      handleChange({ bus_id }, id);
      setSearchVal(val, false);
    } else if (val.includes("Current Location")) {
      const geocoder = new window.google.maps.Geocoder();
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK") {
              if (results[0]) {
                val = results[0].formatted_address;
                handleChange({ val }, id);
                setSearchVal(val, false);
              } else {
                alert("No results");
              }
            } else {
              window.alert("Geocoder failed due to: " + status);
            }
          });
        },
        () => null,
        {
          enableHighAccuracy: true,
        }
      );
    } else {
      handleChange({ val }, id);
      setSearchVal(val, false);
    }

    setRouteData([]);
    setStopData([]);
  };

  return (
    <div className="places">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={searchVal}
          onChange={handleInput}
          disabled={!ready}
          placeholder={placeholder}
          style={{ width: "100%" }}
          data-lpignore="true"
          selectOnClick
        />
        {input && (
          <ComboboxPopover>
            <ComboboxList>
              <ComboboxOption value={`Current Location`}>
                <img
                  src="./userLocation.png"
                  alt="bus"
                  width="20"
                  height="20"
                  style={{ marginRight: "10px" }}
                />
                <ComboboxOptionText />
              </ComboboxOption>

              {
                // display stops that match search and icon
                stopData.length > 0 &&
                  stopData.map(({ stop_id, key, fullname }) => (
                    <ComboboxOption
                      key={key + "_" + stop_id}
                      value={`${fullname} (${stop_id}), Bus Stop`}
                    >
                      <img
                        src="./bus.svg"
                        alt="bus"
                        width="20"
                        height="20"
                        style={{ marginRight: "10px" }}
                      />
                      <ComboboxOptionText />
                    </ComboboxOption>
                  ))
              }

              {
                // display routes that match search and icon
                routeData.length > 0 &&
                  routeData.map(({ route_id, key }) => (
                    <ComboboxOption
                      key={route_id + "_" + key}
                      value={`${route_id}, Bus Route`}
                    >
                      <img
                        src="./route.jpg"
                        alt="route"
                        width="20"
                        height="20"
                        style={{ marginRight: "10px" }}
                      />
                      <ComboboxOptionText />
                    </ComboboxOption>
                  ))
              }
              {
                // display google results and icon
                status === "OK" &&
                  data.map(({ id, description }) => (
                    <ComboboxOption key={description} value={description}>
                      <img
                        src="./location.png"
                        alt="route"
                        width="20"
                        height="20"
                        style={{ marginRight: "10px" }}
                      />
                      <ComboboxOptionText />
                    </ComboboxOption>
                  ))
              }
            </ComboboxList>
          </ComboboxPopover>
        )}
      </Combobox>
    </div>
  );
};

export default PlacesAutocomplete;
