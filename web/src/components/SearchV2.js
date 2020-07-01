import React from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";

import "@reach/combobox/styles.css";

let stops = require("./stops.json");
let stop_data = [];

function searchLocal(query) {
  var filter, count, stop_id, key;
  filter = query.toUpperCase();
  count = 0;

  if (filter.length !== 0) {
    for (var i = 0; i < stops.length; i++) {
      stop_id = stops[i].id.toUpperCase();
      // If entered letters are the prefix for the name of the station enter conditional
      if (stop_id.includes(filter)) {
        key = stops[i].stop_lat - stops[i].stop_lon;
        stop_data.push({ stop_id: stop_id, key: key });
        count += 1;
      }
      if (count > 2) {
        break;
      }
    }
  }
}

const PlacesAutocomplete = () => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 53.35014, lng: () => -6.266155 },
      radius: 100 * 1000,
    },
  });

  const handleInput = (e) => {
    stop_data = [];
    searchLocal(e.target.value);
    setValue(e.target.value);
  };

  const handleSelect = (val) => {
    setValue(val, false);
  };

  return (
    <div>
      <Combobox onSelect={handleSelect} aria-labelledby="demo">
        <ComboboxInput value={value} onChange={handleInput} disabled={!ready} />
        <ComboboxPopover>
          <ComboboxList>
            {stop_data.length > 0 &&
              stop_data.map(({ stop_id, key }) => (
                <ComboboxOption key={key} value={stop_id} />
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
