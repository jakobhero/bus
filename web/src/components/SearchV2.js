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
  var filter, count, stop_id, key;
  filter = query.toUpperCase();
  count = 0;

  if (filter.length !== 0) {
    for (var i = 0; i < stops.length; i++) {
      stop_id = stops[i].stopid.toUpperCase();
      // If entered letters are the prefix for the name of the station enter conditional
      if (stop_id.includes(filter)) {
        key = stops[i].lat - stops[i].lng;
        stop_data.push({ stop_id: stop_id, key: key });
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
        key = route_id;
        route_data.push({ route_id: route_id, key: key });
        count += 1;
      }
      if (count > 2) {
        break;
      }
    }
  }
}

const PlacesAutocomplete = ({ id, handleChange }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 53.35014, lng: () => -6.266155 },
      radius: 100 * 1000,
      componentRestrictions: { country: "ie" },
    },
  });

  const handleInput = (e) => {
    stop_data = [];
    route_data = [];
    searchLocalStop(e.target.value);
    searchLocalRoute(e.target.value);
    setValue(e.target.value);
  };

  const handleSelect = (val) => {
    const stopID = val.slice(0, val.length - 10);
    let lat, lng;

    if (val.includes(", Bus Route")) {
      console.log("Activate me");
      const bus_id = val.slice(0, val.length - 11);
      handleChange({ bus_id }, id);
    } else if (!isNaN(stopID)) {
      for (var i = 0; i < stops.length; i++) {
        let stop_id = stops[i].stopid;
        if (stop_id === stopID) {
          lat = stops[i].lat;
          lng = stops[i].lng;
          handleChange({ stopID, lat, lng }, id);
        }
      }
    } else {
      getGeocode({ address: val })
        .then((results) => getLatLng(results[0]))
        .then((coords) => {
          console.log("📍 Coordinates: ", coords);
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
          placeholder="Choose a location"
          style={{ width: "100%" }}
          data-lpignore="true"
          selectOnClick
        />
        <ComboboxPopover>
          <ComboboxList>
            {stop_data.length > 0 &&
              stop_data.map(({ stop_id, key }) => (
                <ComboboxOption key={key} value={`${stop_id}, Bus Stop`} />
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
