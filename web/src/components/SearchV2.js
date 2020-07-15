import React from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";

import "@reach/combobox/styles.css";

import routes from "./routesInfo";
let stops = require("./stops.json");

let stop_data = [];
let route_data = [];

function searchLocalStop(query) {
  var filter, count, stop_id, key, fullname;
  filter = query.toUpperCase();
  count = 0;

  if (filter.length !== 0) {
    for (var i = 0; i < stops.length; i++) {
      stop_id = stops[i].stopid;
      fullname = stops[i].fullname ? stops[i].fullname.toUpperCase() : "";
      // If entered letters are the prefix for the name of the station enter conditional
      if (stop_id.includes(filter) || fullname.includes(filter)) {
        key = stops[i].lat - stops[i].lng;
        stop_data.push({
          stop_id: stop_id,
          key: key,
          fullname: stops[i].fullname,
        });
        count += 1;
      }
      if (count > 2) {
        break;
      }
    }
  }
}

function searchLocalRoute(query) {
  var filter, count, route_id, key;
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
  }
}

const PlacesAutocomplete = ({ id, handleChange, placeholder, route }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 53.35014, lng: () => -6.266155 },
      radius: 100000, //100 km
      componentRestrictions: { country: "ie" },
    },
  });

  const handleInput = (e) => {
    // when characters are added to the input, then functions are run with the input, if there is a match then add that match to the array, the array is displayed in the dropdown
    try {
      stop_data = [];
      route_data = [];
      searchLocalStop(e.target.value);
      if (route) {
        searchLocalRoute(e.target.value);
      }
      setValue(e.target.value);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (val) => {
    //Firstly if the option was a bus stop, then find the corresponding info for the stop and send the data to the parent via handleChange.
    //Then if it was a route, send bus_id to parent
    // Lastly if it was a place, find the co ords, then send them along with value to parent
    let lat, lng, stopID;
    if (val.includes(", Bus Stop")) {
      stopID = val.split("(")[1];
      stopID = stopID.split(")")[0];
      for (var i = 0; i < stops.length; i++) {
        let stop_id = stops[i].stopid;
        if (stop_id === stopID) {
          lat = stops[i].lat;
          lng = stops[i].lng;
          handleChange({ stopID, lat, lng }, id);
        }
      }
    } else if (val.includes(", Bus Route")) {
      const bus_id = val.slice(0, val.length - 11);
      handleChange({ bus_id }, id);
    } else {
      getGeocode({ address: val })
        .then((results) => getLatLng(results[0]))
        .then((coords) => {
          lat = coords.lat;
          lng = coords.lng;
          handleChange({ val, lat, lng }, id);
        })
        .catch((error) => {
          console.log("😱 Error: ", error);
        });
    }
    setValue(val, false);
  };

  return (
    <div>
      <Combobox onSelect={handleSelect} aria-label="Choose a location">
        <ComboboxInput
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder={placeholder}
          style={{ width: "100%" }}
          data-lpignore="true"
          selectOnClick
        />
        <ComboboxPopover>
          <ComboboxList>
            {stop_data.length > 0 &&
              stop_data.map(({ stop_id, key, fullname }) => (
                <ComboboxOption
                  key={key}
                  value={`${fullname} (${stop_id}), Bus Stop`}
                />
              ))}
            {route_data.length > 0 &&
              route_data.map(({ route_id, key }) => (
                <ComboboxOption key={key} value={`${route_id}, Bus Route`} />
              ))}
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
};

export default PlacesAutocomplete;
