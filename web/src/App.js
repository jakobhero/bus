import "./css/App.css";
import React, { useState } from "react";
import SearchForm from "./components/searchForm";

import ShowMap from "./components/ShowMap";
import Favourites from "./components/favourites";
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
import { getStopNames, getStopNums } from "./components/cookies";
import { TwitterTimelineEmbed } from "react-twitter-embed";

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

  const [favStops, setFavStops] = useState({
    fullname: getStopNames(),
    stopsids: getStopNums(),
  });

  const getRealTimeData = (stop, fullname) => {
    axios
      .get("/api/realtime?stopid=" + stop)
      .then((res) => {
        res["stopid"] = stop;
        res["fullname"] = fullname;
        console.log(fullname);
        setRealTimeData(res);
      })
      .catch(console.log);
  };

  const setRealTime = (route, fullname) => {
    getRealTimeData(route, fullname);
    setActiveKey("realTime");
  };
  const clearMap = () => {
    // setState({})
    setStopsForMap([]);
    setDirections([]);
    setOtherRoute([]);
    setBusIndex([]);
  };

  const handleSubmitApp = (source, dest, time) => {
    let newFields = { ...state };
    newFields["source"] = source;
    newFields["destination"] = dest;
    newFields["time"] = time;
    if (source.bus_id) {
      // if source is a bus route
      clearMap();
      axios
        .get("/api/routeinfo?routeid=" + source.bus_id)
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
      clearMap();
      axios
        .get("/api/nearestneighbor?lat=" + source.lat + "&lng=" + source.lng)
        .then((res) => {
          console.log(res);
          if (res.statusText === "OK") {
            setStopsForMap(res.data.stops);
            setActiveKey("map");
          }
        })
        .catch(console.log);
      setState(newFields);
      console.log("new field", newFields);
    } else if (!dest.val && !dest.stopID && source.stopID) {
      // if source is a bus stop and no destination
      clearMap();
      setRealTime(source.stopID, source.fullname);
      setStopsForMap([
        { stopid: source.stopID, lat: source.lat, lng: source.lng },
      ]);
    } else {
      // otherwise - directions
      clearMap();
      axios
        .get(
          "/api/directions?dep=" +
            source.lat +
            "," +
            source.lng +
            "&arr=" +
            dest.val +
            "&time=" +
            Math.round(time / 1000)
        )
        .then((res) => {
          if (res.data.status === "OK") {
            console.log(res.data.connections);
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
          <Favourites
            setRealTime={setRealTime}
            clearMap={clearMap}
            setStopsForMap={setStopsForMap}
            setActiveKey={setActiveKey}
            setState={setState}
            state={state}
            favStops={favStops}
            setFavStops={setFavStops}
          />
        </TabPane>
        <TabPane tab="Real Time" key="realTime">
          <RealTimeInfo
            realTimeData={realTimeData}
            favStops={favStops}
            setFavStops={setFavStops}
          ></RealTimeInfo>
        </TabPane>
        <TabPane tab="News" key="news">
          <div className="news">
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName="dublinbusnews"
              options={{ height: "30vw" }}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
