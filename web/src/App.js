import "./App.css";
import React, { Component } from "react";
import SearchLocationInput from "./SearchLocationInput";

class App extends Component {
  state = { val: "" };

  render() {
    return (
      <div className="autocomplete-wrapper">
        <h3>Search for a bus stop number</h3>
        <SearchLocationInput></SearchLocationInput>
      </div>
    );
  }
}

export default App;
