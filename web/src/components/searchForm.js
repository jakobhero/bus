import React, { useState } from "react";
import PlacesAutocomplete from "./SearchV2";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../search.css";

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

const SearchForm = () => {
  const [showDestination, setShowDestination] = useState(false);

  return (
    <div>
      <div class="search">
        <PlacesAutocomplete></PlacesAutocomplete>
        <span
          class="fa fa-angle-double-down"
          onClick={() => setShowDestination(!showDestination)}
        ></span>
      </div>
      <PlacesAutocomplete></PlacesAutocomplete>
      {showDestination && <DatePickerFunc></DatePickerFunc>}
      {showDestination && <TimePickerFunc></TimePickerFunc>}
    </div>
  );
};

export default SearchForm;
