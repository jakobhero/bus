import React, { useState } from "react";
import PlacesAutocomplete from "./SearchV2";
import DirectionsIcon from "@material-ui/icons/Directions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BorderWrapper from "react-border-wrapper";
import "../css/search.css";

import { Button } from "antd";

import { getGeocode, getLatLng } from "use-places-autocomplete";

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
      dateFormat="MMMM d, yyyy h:mm aa"
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
    event.preventDefault();
    let newFields = { ...fieldsValues };
    if (newFields.source.val) {
      // if source is a place
      getGeocode({ address: newFields.source.val })
        .then((results) => getLatLng(results[0]))
        .then((coords) => {
          let lat = coords.lat;
          let lng = coords.lng;
          let val = newFields.source.val;
          newFields["source"] = { val: val, lat: lat, lng: lng };
          return newFields;
        })
        .then((newFields) => {
          if (newFields.destination.val) {
            //if destination is a place, if not then it is a bus stop(has coords already) or is blank
            getGeocode({ address: newFields.destination.val })
              .then((results) => getLatLng(results[0]))
              .then((coords) => {
                let lat = coords.lat;
                let lng = coords.lng;
                let val = newFields.destination.val;
                newFields["destination"] = { val: val, lat: lat, lng: lng };
                return newFields;
              })
              .then((newFields) => {
                handleSubmitApp(
                  newFields.source,
                  newFields.destination,
                  newFields.time
                );
              });
          } else {
            handleSubmitApp(
              newFields.source,
              newFields.destination,
              newFields.time
            );
          }
        });
    } else if (newFields.destination.val && newFields.source.stopID) {
      // if source is a bus stop and dest is a place
      getGeocode({ address: newFields.destination.val })
        .then((results) => getLatLng(results[0]))
        .then((coords) => {
          let lat = coords.lat;
          let lng = coords.lng;
          let val = newFields.destination.val;
          newFields["destination"] = { val: val, lat: lat, lng: lng };
          return newFields;
        })
        .then((newFields) => {
          console.log(newFields);
          handleSubmitApp(
            newFields.source,
            newFields.destination,
            newFields.time
          );
        });
    } else {
      handleSubmitApp(newFields.source, newFields.destination, newFields.time);
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
