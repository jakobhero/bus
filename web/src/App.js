import "./css/App.css";
import React, { useState } from "react";
import Page from "react-page-loading";
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

import CookieConsent from "react-cookie-consent";

const { TabPane } = Tabs;

const App = () => {
  const [state, setState] = React.useState({});
  const [activeKey, setActiveKey] = React.useState("map");
  const [tripTimes, setTripTimes] = React.useState([]);
  const [index, setIndex] = useState(0);

  const [realTimeData, setRealTimeData] = useState([]);
  const [stopsForMap, setStopsForMap] = useState([]);
  const [otherRoute, setOtherRoute] = useState([]);

  const [busIndex, setBusIndex] = useState([]);
  const [directions, setDirections] = useState([]);

  const [sortStepsNum, setSortStepsNum] = useState(1);
  const [sortTimeNum, setSortTimeNum] = useState(-1);

  const [searchValS, setSearchValS] = useState("");
  const [searchValD, setSearchValD] = useState("");

  const [favStops, setFavStops] = useState({
    fullname: getStopNames(),
    stopsids: getStopNums(),
  });

  const getRealTimeData = (stop, fullname) => {
    axios
      .get("/api/realtime?stopid=" + stop)
      .then((res) => {
        res["stopid"] = parseInt(stop, 10);
        res["fullname"] = fullname;
        setRealTimeData(res);
      })
      .catch(console.log);
  };

  const setRealTime = (route, fullname) => {
    getRealTimeData(route, fullname);
    setActiveKey("realTime");
  };
  const clearMap = () => {
    setStopsForMap([]);
    setDirections([]);
    setOtherRoute([]);
    setBusIndex([]);
  };

  const getStopsByCoords = (lat, lng, local = false) => {
    clearMap();
    axios
      .get("/api/nearestneighbor?lat=" + lat + "&lng=" + lng)
      .then((res) => {
        if (res.statusText === "OK") {
          if (local) {
            setState({});
          }

          setStopsForMap(res.data.stops);
          setActiveKey("map");
        }
      })
      .catch(console.log);
  };

  const handleSubmitApp = (source, dest, time) => {
    let newFields = { ...state };
    newFields["source"] = source;
    newFields["destination"] = dest;
    newFields["time"] = time;
    setState(newFields);
    if (source.bus_id) {
      // if source is a bus route
      clearMap();
      axios
        .get("/api/routeinfo?routeid=" + source.bus_id)
        .then((res) => {
          if (res.statusText === "OK") {
            setStopsForMap(res.data["1"]);
            setOtherRoute(res.data["2"]);
            setActiveKey("map");
          }
        })
        .catch(console.log);
    } else if (!dest.val && !dest.stopID && !source.stopID) {
      // if source is a place and no destination
      getStopsByCoords(source.lat, source.lng);
    } else if (!dest.val && !dest.stopID && source.stopID) {
      // if source is a bus stop and no destination
      clearMap();
      setRealTime(source.stopID, source.fullname);
      setStopsForMap([
        {
          stopid: source.stopID,
          lat: source.lat,
          lng: source.lng,
          fullname: source.fullname,
          lines: source.lines,
        },
      ]);
    } else {
      // otherwise - directions
      clearMap();
      setIndex(0);
      axios
        .get(
          "/api/directions?dep=" +
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
            setBusIndex(res.data.connections[0].transit_index);
          }
        })
        .catch(console.log);
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
      <Page loader={"bar"} color={"#1b55db"} size={15}>
        <CookieConsent
          location="top"
          buttonText="Accept"
          cookieName="acceptCookies"
          style={{ background: "#2B373B" }}
          buttonStyle={{
            color: "#4e503b",
            fontSize: "13px",
            fontWeight: "bold",
          }}
          overlay
          sameSite={"strict"}
        >
          This website uses cookies to enhance the user experience.{" "}
        </CookieConsent>
        <SearchForm
          handleSubmitApp={handleSubmitApp}
          searchValD={searchValD}
          searchValS={searchValS}
          setSearchValD={setSearchValD}
          setSearchValS={setSearchValS}
        />
        <Tabs
          style={{ margin: 10 }}
          onChange={changeActiveTab}
          activeKey={activeKey}
          size={"large"}
          animated={{ inkBar: true, tabPane: true }}
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
              getStopsByCoords={getStopsByCoords}
              favStops={favStops}
              setFavStops={setFavStops}
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
                <Button
                  style={{ margin: 20 }}
                  type="submit"
                  onClick={sortSteps}
                >
                  <DirectionsBusIcon></DirectionsBusIcon>
                  <SortIcon></SortIcon>
                </Button>
              </Tooltip>
            )}
            <AllRoutes
              tripTimes={tripTimes}
              setDirections={setDirections}
              index={index}
              setIndex={setIndex}
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
              setSearchVal={setSearchValS}
            />
          </TabPane>
          <TabPane tab="Real Time" key="realTime">
            <RealTimeInfo
              realTimeData={realTimeData}
              favStops={favStops}
              setFavStops={setFavStops}
              setRealTime={setRealTime}
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
      </Page>
    </div>
  );
};

export default App;
