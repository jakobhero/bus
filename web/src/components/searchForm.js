import React, { useState } from "react";
import PlacesAutocomplete from "./SearchV2";
import DirectionsIcon from "@material-ui/icons/Directions";
import SwapVert from "@material-ui/icons/SwapVert";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BorderWrapper from "react-border-wrapper";
import "../css/search.css";
import Tooltip from "@material-ui/core/Tooltip";

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

const SearchForm = ({
  handleSubmitApp,
  searchValS,
  searchValD,
  setSearchValS,
  setSearchValD,
}) => {
  const [showDestination, setShowDestination] = useState(false);

  const [fieldsValues, setFieldsValues] = React.useState({
    source: "",
    destination: "",
    time: new Date().getTime(),
  });

  const handleChange = (value, fieldId) => {
    let newFields = { ...fieldsValues };
    if (fieldId === "time") {
      //converting to unix
      newFields[fieldId] = new Date(value.date).getTime();
    } else {
      newFields[fieldId] = value;
    }
    setFieldsValues(newFields);
  };

  const handleDirectionsClick = () => {
    let newFields = { ...fieldsValues };
    newFields["destination"] = "";
    setFieldsValues(newFields);
    setShowDestination(!showDestination);
    setSearchValD("");
  };

  const handleSwapClick = () => {
    let newFields = { ...fieldsValues };
    let temp = newFields.destination;
    newFields.destination = newFields.source;
    newFields.source = temp;
    console.log(newFields);
    setSearchValD(searchValS);
    setSearchValS(searchValD);
    setFieldsValues(newFields);
  };

  function handleSubmit(event) {
    // Must make sure that all but route have a lat and lng attached to them, bus stops have this already, places require a lookup
    event.preventDefault();
    let newFields = { ...fieldsValues };
    if (
      !newFields.source.stopID &&
      !newFields.source.bus_id &&
      searchValS !== newFields.source.val
    ) {
      newFields.source = { val: searchValS };
    }

    if (newFields.source.val === "") {
      // No source
      alert("Please enter an Origin");
    } else if (newFields.source.val) {
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
          handleSubmitApp(
            newFields.source,
            newFields.destination,
            newFields.time
          );
        });
    } else if (newFields.source.bus_id && newFields.destination) {
      // if bus route and any destination
      alert("Invalid selection");
    } else {
      // only case left, is only bus stop and no direction
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
              searchVal={searchValS}
              setSearchVal={setSearchValS}
              placeholder={"Enter a location, stop or bus route"}
              route
            />
            <Tooltip className="tooltip" title="Directions">
              <DirectionsIcon
                className="directionsButton"
                onClick={handleDirectionsClick}
              />
            </Tooltip>
            <br />
          </div>
          {showDestination && (
            <div>
              <div className="search">
                <PlacesAutocomplete
                  id={"destination"}
                  handleChange={handleChange}
                  searchVal={searchValD}
                  setSearchVal={setSearchValD}
                  placeholder={"Enter a destination"}
                />
                <Tooltip className="tooltip" title="Swap">
                  <SwapVert
                    onClick={handleSwapClick}
                    className="directionsButton"
                  />
                </Tooltip>
                <br />
              </div>
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
