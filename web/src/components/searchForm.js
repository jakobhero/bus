import React, { useState } from "react";
import PlacesAutocomplete from "./SearchV2";
import DirectionsIcon from "@material-ui/icons/Directions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BorderWrapper from "react-border-wrapper";
import "../css/search.css";

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

const SearchForm = ({ handleSubmitApp }) => {
  const [showDestination, setShowDestination] = useState(false);

  const [fieldsValues, setFieldsValues] = React.useState({
    source: "",
    destination: "",
    time: new Date().getTime(),
  });
  const handleChange = (value, fieldId) => {
    let newFields = { ...fieldsValues };
    if (fieldId === "time") {
      newFields[fieldId] = new Date(value.date).getTime();
    } else {
      newFields[fieldId] = value;
    }
    setFieldsValues(newFields);
  };

  function handleSubmit(event) {
    if (fieldsValues.source !== "") {
      console.log(fieldsValues);
      event.preventDefault();
      handleSubmitApp(
        fieldsValues.source,
        fieldsValues.destination,
        fieldsValues.time
      );
    } else {
      alert("Please enter a source!");
    }
  }

  const icon = (
    <div style={{ width: "50px" }}>
      <img
        style={{ width: "50px" }}
        src={"./bus.svg"}
        alt="react border wrapper logo"
      />
    </div>
  );

  return (
    <form>
      <div className="mainForm">
        <BorderWrapper
          borderColour="#1b55db"
          borderWidth="2px"
          borderRadius="15px"
          borderType="solid"
          innerPadding="20px"
          topElement={icon}
          topPosition={0.05}
          topOffset="22px"
          topGap="4px"
          id="borderW"
        >
          <div className="search">
            <PlacesAutocomplete
              id={"source"}
              handleChange={handleChange}
              value={fieldsValues["source"]}
              placeholder={"Enter a location, stop or bus route"}
              route
            />

            <DirectionsIcon
              className="directionsButton"
              onClick={() => setShowDestination(!showDestination)}
              //consider making it clear destination state
            />
            <br />
          </div>
          {showDestination && (
            <div>
              <PlacesAutocomplete
                id={"destination"}
                handleChange={handleChange}
                value={fieldsValues["destination"]}
                placeholder={"Enter a destination"}
              />
              <br />
              <DatePickerFunc handleChange={handleChange} id={"time"} />
            </div>
          )}
          <Button style={{ margin: 20 }} type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </BorderWrapper>
      </div>
    </form>
  );
};

export default SearchForm;
