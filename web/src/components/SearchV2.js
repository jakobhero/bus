import React, { useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import axios from "axios";
import "@reach/combobox/styles.css";

import routes from "./routesInfo";

const PlacesAutocomplete = ({ id, handleChange, placeholder, route }) => {
  const [stopData, setStopData] = useState([]);
  const [routeData, setRouteData] = useState([]);

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
  function searchLocalStop(query) {
    axios
      .get("http://localhost/stops?substring=" + query)
      .then((res) => {
        if (res.statusText === "OK") {
          setStopData(res.data.stops);
        }
      })
      .catch(console.log);
  }

  function searchLocalRoute(query) {
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
    // when characters are added to the input, then functions are run with the input, if there is a match then add that match to the array, the array is displayed in the dropdown
    try {
      setRouteData([]);
      setStopData([]);
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
      for (var i = 0; i < stopData.length; i++) {
        let stop_id = stopData[i].stop_id;
        if (stop_id === stopID) {
          lat = stopData[i].lat;
          lng = stopData[i].lng;
          handleChange({ stopID, lat, lng }, id);
        }
      }
    } else if (val.includes(", Bus Route")) {
      const bus_id = val.slice(0, val.length - 11);
      handleChange({ bus_id }, id);
    } else {
      handleChange({ val }, id);
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
            {stopData.length > 0 &&
              stopData.map(({ stop_id, key, fullname }) => (
                <ComboboxOption
                  key={key}
                  value={`${fullname} (${stop_id}), Bus Stop`}
                />
              ))}
            {routeData.length > 0 &&
              routeData.map(({ route_id, key }) => (
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
