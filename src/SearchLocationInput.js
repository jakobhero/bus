import React, { Component, useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { FontAwesome } from "react-icons/fa";
import { MaterialDesign } from "react-icons/md";
import {FaTwitter} from "react-icons/fa"
import {font_download} from "react-icons/md";
import { Layout, Menu, Input, Breadcrumb, DatePicker } from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import './App.css';
import { Tabs, Checkbox } from 'antd';
import moment from 'moment';
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
const { RangePicker } = DatePicker;

const dateFormat = 'YYYY/MM/DD';
const monthFormat = 'YYYY/MM';

const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY'];


const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

function callback(key) {
    console.log(key);
  }
  function onChange(e) {
    console.log(`checked = ${e.target.checked}`);
  }

  
function SearchLocationInput(props) {
  const[station, setStation] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const autoCompleteRef = useRef(null);
  const autoCompleteRef2 = useRef(null);

  function handleSubmit (event)  {
    alert(`${source}, ${destination}`)
    event.preventDefault()
}

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
      <form >
      
        <div>
      <input 
    className="search-input"
    ref={autoCompleteRef}
    onChange={(event) => setSource(event.target.value)}
    placeholder="Enter a Location"
    value={source}
    onKeyDown={searchName(source)}
    style={{ margin: 20 }}
      
      />
<br />
    <br />
    <input
        className="search-input"
        ref={autoCompleteRef2}
        onChange={(event) => setDestination(event.target.value)}
        placeholder="Enter a Location"
        value={destination}
        onKeyUp={searchName(destination)}
        style={{ margin: 20 }}
      />
      </div>
      
      
    <br />
    <br />
    <div>
            <label style={{ margin: 10 }}>Enter a date for your journey  </label>
    <DatePicker defaultValue={moment('2015/01/01', dateFormat)} format={dateFormat} />
    </div>
    <br />
    <br />
    <Checkbox style={{ margin: 10 }} onChange={onChange}>Show Map</Checkbox>
    <Button
    style={{ margin: 20 }}
     type="submit" onClick={handleSubmit}>Submit</Button>
    <Tabs style={{ margin: 10 }}defaultActiveKey="1" onChange={callback}>
      <TabPane tab="Map" key="1">
    </TabPane>


    <TabPane tab="Connections" key="2">
      Connections
    </TabPane>
    <TabPane tab="Locations" key="3">
    <div>
      <FaTwitter />
      
    </div>
    <div>
      <font_download />
    </div>
      Locations
    </TabPane>
    <TabPane tab="Real Time" key="4">
      Real Time
    </TabPane>
  </Tabs>
  
  </form>
  
  );
  
}


export default SearchLocationInput;
