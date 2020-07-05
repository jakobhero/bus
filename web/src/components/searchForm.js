import React, { useState } from "react";
import PlacesAutocomplete from "./SearchV2";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../search.css";

import { Button } from "antd";

const DatePickerFunc = ({ handleChange }) => {
  const [startDate, setStartDate] = useState(new Date());

  const handleSelect = (date) => {
    setStartDate(date);
    handleChange({ date }, "time");
  };

  return (
    <DatePicker
      selected={startDate}
      onChange={handleSelect}
      withPortal
      timeIntervals={15}
      showTimeSelect
      // isClearable
      // minTime={setHours(setMinutes(new Date(), 0), 5)}
      dateFormat="MMMM d, yyyy h:mm aa"
      // maxTime={setHours(setMinutes(new Date(), 30), 20)}
    />
  );
};

const SearchForm = ({ fields, handleSubmitApp }) => {
  const [showDestination, setShowDestination] = useState(false);

  const [fieldsValues, setFieldsValues] = React.useState({});
  const handleChange = (value, fieldId) => {
    let newFields = { ...fieldsValues };
    newFields[fieldId] = value;

    setFieldsValues(newFields);
  };

  function handleSubmit(event) {
    console.log(fieldsValues);
    event.preventDefault();
    handleSubmitApp(fieldsValues.source, fieldsValues.destination);
  }

  return (
    <form>
      <h3>Search for a bus stop number</h3>
      <div className="search">
        <PlacesAutocomplete
          id={"source"}
          handleChange={handleChange}
          value={fieldsValues["source"]}
        />

        <span
          className="fa fa-angle-double-down"
          onClick={() => setShowDestination(!showDestination)}
        ></span>
      </div>
      <PlacesAutocomplete
        id={"destination"}
        handleChange={handleChange}
        value={fieldsValues["destination"]}
      />
      {showDestination && (
        <DatePickerFunc handleChange={handleChange} id={"time"} />
      )}
      <Button style={{ margin: 20 }} type="submit" onClick={handleSubmit}>
        Submit
      </Button>
    </form>
  );
};

export default SearchForm;
