import React, { useState } from "react";
import PlacesAutocomplete from "./SearchV2";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../search.css";

import { Button } from "antd";

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
          key={"source"}
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
        key={"destination"}
        id={"destination"}
        handleChange={handleChange}
        value={fieldsValues["destination"]}
      />
      {showDestination && <DatePickerFunc></DatePickerFunc>}
      {showDestination && <TimePickerFunc></TimePickerFunc>}
      <Button style={{ margin: 20 }} type="submit" onClick={handleSubmit}>
        Submit
      </Button>
    </form>
  );
};

export default SearchForm;
