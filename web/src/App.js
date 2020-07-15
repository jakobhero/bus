import "./css/App.css";
import React, { useState } from "react";
import Route from "./components/route";
import SearchForm from "./components/searchForm";

import ShowMap from "./components/ShowMap";
import RealTimeInfo from "./components/RealTime";

import { Tabs, Button } from "antd";
import "antd/dist/antd.css";

import axios from "axios";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import SortIcon from "@material-ui/icons/Sort";
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import Tooltip from "@material-ui/core/Tooltip";

import { findPoly } from "./components/polylines.js";

const { TabPane } = Tabs;

let stops = require("./components/stops.json");

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function getDistance(latitude1, longitude1, latitude2, longitude2) {
  const earth_radius = 6371;

  const dLat = degrees_to_radians(latitude2 - latitude1);
  const dLon = degrees_to_radians(longitude2 - longitude1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degrees_to_radians(latitude1)) *
      Math.cos(degrees_to_radians(latitude2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));

  return earth_radius * c;
}
function findStopsRadius(lat, lng) {
  let showMarkers = [];
  for (var i = 0; i < stops.length; i++) {
    let dist = getDistance(stops[i].lat, stops[i].lng, lat, lng);
    if (dist < 0.5) {
      showMarkers.push(stops[i]);
    }
  }
  return showMarkers;
}

const App = () => {
  const [state, setState] = React.useState({});
  const [activeKey, setActiveKey] = React.useState("1");
  const [tripTimes, setTripTimes] = React.useState([]);
  const [centre, setCentre] = React.useState({
    lat: 53.35014,
    lng: -6.266155,
  });

  const [realTimeData, setRealTimeData] = useState([]);
  const [stopsForMap, setStopsForMap] = useState([]);
  const [otherRoute, setOtherRoute] = useState([]);

  const [busIndex, setBusIndex] = useState([]);
  const [directions, setDirections] = useState([]);

  const getData = (stop) => {
    axios
      .get("http://localhost/realtime?stopid=" + stop)
      .then((res) => {
        res["stopid"] = stop;
        // return res;
        setRealTimeData(res);
      })
      .catch(console.log);
  };

  const setRealTime = (route) => {
    getData(route);
    setActiveKey("4");
  };

  const handleSubmitApp = (source, dest, time) => {
    let newFields = { ...state };
    newFields["source"] = source;
    newFields["destination"] = dest;
    newFields["time"] = time;

    if (source.bus_id) {
      axios
        .get("http://localhost/routeinfo?routeid=" + source.bus_id)
        .then((res) => {
          if (res.statusText === "OK") {
            setStopsForMap(res.data[0]);
            setOtherRoute(res.data[1]);
            setActiveKey("1");
          }
        })
        .catch(console.log);
    } else if (!dest.val && !dest.stopID && !source.stopID) {
      setCentre({ lat: source.lat, lng: source.lng });
      setDirections([]);
      setOtherRoute([]);
      setStopsForMap(findStopsRadius(source.lat, source.lng));
      setActiveKey("1");
    } else if (!dest.val && source.stopID) {
      setRealTime(source.stopID);
      setCentre({ lat: source.lat, lng: source.lng });
      let tempStop = [];
      for (var j = 0; j < stops.length; j++) {
        if (stops[j].id === source.stopID) {
          tempStop.push(stops[j]);
        }
      }
      setStopsForMap(tempStop);
    } else {
      axios
        .get(
          "http://localhost/directions?dep=" +
            source.lat +
            "," +
            source.lng +
            "&arr=" +
            dest.lat +
            "," +
            dest.lng +
            "&time=" +
            Math.round(time / 1000)
        )
        .then((res) => {
          if (res.data.status === "OK") {
            setTripTimes(res.data.connections);
            setDirections(findPoly(res.data.connections[0]));
            setStopsForMap([]);
            setOtherRoute([]);
            setBusIndex(res.data.connections[0].transit_index);
          }
        })
        .catch(console.log);
      setState(newFields);
      let newCentre = {
        lat: (source.lat + dest.lat) / 2,
        lng: (source.lng + dest.lng) / 2,
      };
      setCentre(newCentre);
      setActiveKey("2");
    }
  };

  function callback(key) {
    setActiveKey(key);
  }

  const [sortStepsNum, setSortStepsNum] = useState(1);
  const [sortTimeNum, setSortTimeNum] = useState(1);

  const sortSteps = () => {
    const tripTimesCopy = [...tripTimes];
    tripTimesCopy.sort((a, b) =>
      a.steps.length > b.steps.length
        ? sortStepsNum
        : b.steps.length > a.steps.length
        ? -sortStepsNum
        : 0
    );
    setTripTimes(tripTimesCopy);
    setSortStepsNum(-sortStepsNum);
  };

  const sortTime = () => {
    const tripTimesCopy = [...tripTimes];
    tripTimesCopy.sort((a, b) =>
      a.end.time > b.end.time
        ? sortTimeNum
        : b.end.time > a.end.time
        ? -sortTimeNum
        : 0
    );
    setTripTimes(tripTimesCopy);
    setSortTimeNum(-sortTimeNum);
  };

  return (
    <div className="App">
      <SearchForm handleSubmitApp={handleSubmitApp} />
      <Tabs style={{ margin: 10 }} onChange={callback} activeKey={activeKey}>
        <TabPane tab="Map" key="1">
          <ShowMap
            source={state.source}
            destination={state.destination}
            stops={stopsForMap}
            centreON={centre}
            setRealTime={setRealTime}
            otherRoute={otherRoute}
            directions={directions}
            busIndex={busIndex}
          />
        </TabPane>

        <TabPane tab="Connections" key="2">
          {tripTimes.length > 0 && (
            <Tooltip title="Sort by arrival time">
              <Button style={{ margin: 20 }} type="submit" onClick={sortTime}>
                <AccessTimeIcon></AccessTimeIcon>
                <SortIcon></SortIcon>
              </Button>
            </Tooltip>
          )}
          {tripTimes.length > 0 && (
            <Tooltip title="Sort by bus changes">
              <Button style={{ margin: 20 }} type="submit" onClick={sortSteps}>
                <DirectionsBusIcon></DirectionsBusIcon>
                <SortIcon></SortIcon>
              </Button>
            </Tooltip>
          )}
          {tripTimes.map((dueTime, i) => (
            <Route key={i} tripTime={dueTime} setDirections={setDirections} />
          ))}
          {tripTimes.length < 1 && <p>Choose a source and destination</p>}
        </TabPane>

        <TabPane tab="Locations" key="3">
          Locations
        </TabPane>
        <TabPane tab="Real Time" key="4">
          {realTimeData.data && (
            <RealTimeInfo realTimeData={realTimeData}></RealTimeInfo>
          )}
          {/* {realTimeData.data && <p>Select a bus stop</p>} */}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
