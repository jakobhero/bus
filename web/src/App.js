import "./css/App.css";
import React, { useState } from "react";
import SearchForm from "./components/searchForm";

import ShowMap from "./components/ShowMap";
import RealTimeInfo from "./components/RealTime";
import AllRoutes from "./components/allRoutes";

import { Tabs, Button } from "antd";
import "antd/dist/antd.css";

import axios from "axios";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import SortIcon from "@material-ui/icons/Sort";
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import Tooltip from "@material-ui/core/Tooltip";

import { findPoly } from "./components/polylines.js";

const { TabPane } = Tabs;

const App = () => {
  const [state, setState] = React.useState({});
  const [activeKey, setActiveKey] = React.useState("map");
  const [tripTimes, setTripTimes] = React.useState([]);

  const [realTimeData, setRealTimeData] = useState([]);
  const [stopsForMap, setStopsForMap] = useState([]);
  const [otherRoute, setOtherRoute] = useState([]);

  const [busIndex, setBusIndex] = useState([]);
  const [directions, setDirections] = useState([]);

  const [sortStepsNum, setSortStepsNum] = useState(1);
  const [sortTimeNum, setSortTimeNum] = useState(1);

  const getRealTimeData = (stop) => {
    axios
      .get("http://localhost/realtime?stopid=" + stop)
      .then((res) => {
        res["stopid"] = stop;
        setRealTimeData(res);
      })
      .catch(console.log);
  };

  const setRealTime = (route) => {
    getRealTimeData(route);
    setActiveKey("realTime");
  };

  const handleSubmitApp = (source, dest, time) => {
    let newFields = { ...state };
    newFields["source"] = source;
    newFields["destination"] = dest;
    newFields["time"] = time;

    if (source.bus_id) {
      // if source is a bus route
      axios
        .get("http://localhost/routeinfo?routeid=" + source.bus_id)
        .then((res) => {
          if (res.statusText === "OK") {
            setStopsForMap(res.data[0]);
            setOtherRoute(res.data[1]);
            setActiveKey("map");
          }
        })
        .catch(console.log);
    } else if (!dest.val && !dest.stopID && !source.stopID) {
      // if source is a place and no destination
      setDirections([]);
      setOtherRoute([]);
      axios
        .get("http://localhost/stops?lat=" + source.lat + "&lng=" + source.lng)
        .then((res) => {
          console.log(res);
          if (res.statusText === "OK") {
            setStopsForMap(res.data.stops);
            setActiveKey("map");
          }
        })
        .catch(console.log);
    } else if (!dest.val && !dest.stopID && source.stopID) {
      // if source is a bus stop and no destination
      setRealTime(source.stopID);
      setStopsForMap([
        { stopid: source.stopID, lat: source.lat, lng: source.lng },
      ]);
    } else {
      // otherwise - directions
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
      setActiveKey("connections");
    }
  };

  function changeActiveTab(key) {
    setActiveKey(key);
  }

  const sortSteps = () => {
    // Sort route alternatives by number of steps(bus changeovers)
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
    // sort by arrival time
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
      <Tabs
        style={{ margin: 10 }}
        onChange={changeActiveTab}
        activeKey={activeKey}
      >
        <TabPane tab="Map" key="map">
          <ShowMap
            source={state.source}
            destination={state.destination}
            stops={stopsForMap}
            setRealTime={setRealTime}
            otherRoute={otherRoute}
            directions={directions}
            busIndex={busIndex}
          />
        </TabPane>

        <TabPane tab="Connections" key="connections">
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
          <AllRoutes
            tripTimes={tripTimes}
            setDirections={setDirections}
          ></AllRoutes>
        </TabPane>

        <TabPane tab="Favourites" key="favourites">
          Locations
        </TabPane>
        <TabPane tab="Real Time" key="realTime">
          <RealTimeInfo realTimeData={realTimeData}></RealTimeInfo>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
