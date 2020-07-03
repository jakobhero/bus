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

const SearchForm = ({ fields }) => {
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
  }

  return (
    <form>
      {fields.map((field) => (
        <PlacesAutocomplete
          key={field}
          id={field}
          handleChange={handleChange}
          value={fieldsValues[field]}
        />
      ))}
      <span
        className="fa fa-angle-double-down"
        onClick={() => setShowDestination(!showDestination)}
      ></span>
      {showDestination && <DatePickerFunc></DatePickerFunc>}
      {showDestination && <TimePickerFunc></TimePickerFunc>}
      <Button style={{ margin: 20 }} type="submit" onClick={handleSubmit}>
        Submit
      </Button>
    </form>
  );
};

export default SearchForm;
