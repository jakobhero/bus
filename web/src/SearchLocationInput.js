import React, { useState, useEffect, useRef } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
let autoComplete;
let autoComplete2;

var bus_lines = [
  "68",
  "25B",
  "45A",
  "25A",
  "14",
  "77A",
  "39",
  "16",
  "40D",
  "27B",
  "142",
  "83",
  "130",
  "15",
  "46A",
  "33",
  "7",
  "39A",
  "49",
  "1",
  "123",
  "41",
  "67X",
  "59",
  "9",
  "40",
  "239",
  "76",
  "84",
  "53",
  "185",
  "151",
  "13",
  "15B",
  "65B",
  "29A",
  "61",
  "140",
  "79A",
  "38A",
  "31",
  "33B",
  "69",
  "44",
  "42",
  "67",
  "184",
  "238",
  "145",
  "17A",
  "32",
  "27A",
  "17",
  "27X",
  "18",
  "122",
  "54A",
  "66",
  "150",
  "56A",
  "37",
  "27",
  "15A",
  "65",
  "11",
  "47",
  "79",
  "83A",
  "63",
  "4",
  "120",
  "41C",
  "70",
  "84A",
  "220",
  "39X",
  "32X",
  "68A",
  "84X",
  "38",
  "102",
  "270",
  "51X",
  "33X",
  "75",
  "26",
  "66A",
  "31A",
  "111",
  "14C",
  "114",
  "76A",
  "44B",
  "161",
  "7A",
  "43",
  "25",
  "104",
  "33A",
  "16C",
  "42D",
  "31B",
  "66X",
  "31D",
  "33D",
  "41B",
  "40B",
  "7D",
  "46E",
  "38D",
  "118",
  "51D",
  "15D",
  "41A",
  "25D",
  "66B",
  "38B",
  "236",
  "7B",
  "41X",
  "69X",
  "68X",
  "25X",
  "40E",
  "70D",
  "116",
  "77X",
  "16D",
  "33E",
  "41D",
];

let stops = require("./components/stops.json");
const loadScript = (url, callback) => {
  let script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = () => callback();
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

function handleScriptLoad(
  updateQuery,
  updateQuery2,
  autoCompleteRef,
  autoCompleteRef2
) {
  autoComplete = new window.google.maps.places.Autocomplete(
    autoCompleteRef.current,
    { types: ["establishment"], componentRestrictions: { country: "ie" } }
  );
  autoComplete.setFields(["address_components", "formatted_address"]);
  autoComplete.addListener("place_changed", () =>
    handlePlaceSelect(updateQuery)
  );

  autoComplete2 = new window.google.maps.places.Autocomplete(
    autoCompleteRef2.current,
    { types: ["establishment"], componentRestrictions: { country: "ie" } }
  );
  autoComplete2.setFields(["address_components", "formatted_address"]);
  autoComplete2.addListener("place_changed", () =>
    handlePlaceSelect(updateQuery2)
  );
}

async function handlePlaceSelect(updateQuery) {
  const addressObject = autoComplete.getPlace();
  if (addressObject != null) {
    console.log("passed");
    const query = addressObject.formatted_address;

    updateQuery(query);
  }
  console.log(addressObject);

  const addressObject2 = autoComplete2.getPlace();
  if (addressObject2 != null) {
    const query2 = addressObject2.formatted_address;
    updateQuery(query2);
  }

  console.log(addressObject2);
}

function searchName(query) {
  console.log("Search");
  console.log(query);
  var filter, count, address;
  filter = query.toUpperCase();
  count = 0;

  if (filter.length !== 0) {
    document.getElementsByClassName(
      "pac-container pac-logo hdpi"
    )[0].innerHTML = "";
    for (var i = 0; i < bus_lines.length; i++) {
      address = bus_lines[i];
      // If entered letters are the prefix for the name of the station enter conditional
      if (address.substr(0, query.length).toUpperCase() === filter) {
        count += 1;
        // Create a dropdown list of all the possible stations with letters being searched
        var b = document.createElement("DIV");
        b.setAttribute("class", "pac-item areasearch");
        b.innerHTML =
          '<span class="pac-icon pac-icon-areas"></span><span class="pac-item-query"><span class="pac-matched">' +
          address +
          "</span></span>";
        b.innerHTML += "<span> Bus line</span>";
        b.innerHTML += "<input type='hidden' value='" + bus_lines[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        // document.getElementById(".pac-container").css('display', '')
        document
          .getElementsByClassName("pac-container pac-logo hdpi")[0]
          .append(b);
      }
      if (count > 2) {
        break;
      }
    }

    count = 0;
    for (i = 0; i < stops.length; i++) {
      address = stops[i].id;
      // If entered letters are the prefix for the name of the station enter conditional
      if (address.includes(filter)) {
        count += 1;
        // Create a dropdown list of all the possible stations with letters being searched
        b = document.createElement("DIV");
        b.setAttribute("class", "pac-item areasearch");
        b.innerHTML =
          '<span class="pac-icon pac-icon-areas"></span><span class="pac-item-query"><span class="pac-matched">' +
          address.toUpperCase() +
          "</span></span>";
        b.innerHTML += "<span>" + stops[i].address + "</span>";
        b.innerHTML += "<input type='hidden' value='" + stops[i].id + "'>";
        document
          .getElementsByClassName("pac-container pac-logo hdpi")[0]
          .append(b);
      }
      if (count > 2) {
        break;
      }
    }
  }
}

function DatePickerFunc() {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      withPortal
    />
  );
}

function TimePickerFunc() {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="h:mm aa"
      withPortal
    />
  );
}

function SearchLocationInput() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const autoCompleteRef = useRef(null);
  const autoCompleteRef2 = useRef(null);

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_eCNDMfLDrxbweb-FbZ4TzaVJtnN1rHY&libraries=places`,
      () =>
        handleScriptLoad(
          setSource,
          setDestination,
          autoCompleteRef,
          autoCompleteRef2
        )
    );
  }, []);

  return (
    <div className="search-location-input">
      <input
        className="search-input"
        ref={autoCompleteRef}
        onChange={(event) => setSource(event.target.value)}
        placeholder="Enter a Location"
        value={source}
        onKeyUp={searchName(source)}
      />
      <br></br>
      <input
        className="search-input"
        ref={autoCompleteRef2}
        onChange={(event) => setDestination(event.target.value)}
        placeholder="Enter a Location"
        value={destination}
        onKeyUp={searchName(destination)}
      />
      <DatePickerFunc></DatePickerFunc>
      <TimePickerFunc></TimePickerFunc>
    </div>
  );
}

export default SearchLocationInput;

// apiKey="AIzaSyA_eCNDMfLDrxbweb-FbZ4TzaVJtnN1rHY"
// autocompletionRequest={{
//   location: { lat: 53.350140, lng: -6.266155 },
//   radius: 100,
//   types: ['establishment']
// }}
