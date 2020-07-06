import "./App.css";
import React, { useState } from "react";
import Route from "./components/route";
import SearchForm from "./components/searchForm";

import ShowMap from "./components/ShowMap";
import RealTimeInfo from "./components/RealTime";

// import { Layout, Menu, Input, Breadcrumb, DatePicker } from "antd";
import { Tabs, Button } from "antd";
import "antd/dist/antd.css";

import axios from "axios";

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
    let dist = getDistance(stops[i].stop_lat, stops[i].stop_lon, lat, lng);
    if (dist < 0.5) {
      showMarkers.push(stops[i]);
    }
  }
  return showMarkers;
}
const App = () => {
  const [state, setState] = React.useState({});
  const [activeKey, setActiveKey] = React.useState("1");
  const [dueTimes, setDueTimes] = React.useState([]);
  const [centre, setCentre] = React.useState({
    lat: 53.35014,
    lng: -6.266155,
  });

  const [realTimeData, setRealTimeData] = useState([]);
  const [stopsForMap, setStopsForMap] = useState([]);

  const getData = (stop) => {
    axios
      .get("http://localhost/realtime?stopid=" + stop)
      .then((res) => {
        setRealTimeData(res.data);
      })
      .catch(console.log);
  };

  const handleSubmitApp = (source, dest, time) => {
    let newFields = { ...state };
    newFields["source"] = source;
    newFields["destination"] = dest;
    newFields["time"] = time;

    if (source.busNum) {
      getData(source.busNum);
      setCentre({ lat: source.lat, lng: source.lng });
      setActiveKey("4");
    } else if (!dest.val) {
      setCentre({ lat: source.lat, lng: source.lng });
      setStopsForMap(findStopsRadius(source.lat, source.lng));
    } else {
      axios
        .get(
          "http://localhost/directions?dep=" +
            source.val +
            "&arr=" +
            dest.val +
            "&time=" +
            time / 1000
        )
        .then((res) => {
          if (res.data.status === "OK") {
            setDueTimes(res.data.connections);
            console.log(dueTimes);
          }
          console.log(res.data);
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

  const Sort = (num) => {
    const dueTimesCopy = [...dueTimes];
    dueTimesCopy.sort((a, b) =>
      a.steps.length > b.steps.length
        ? num
        : b.steps.length > a.steps.length
        ? -num
        : 0
    );
    // console.log(dueTimes);
    setDueTimes(dueTimesCopy);
  };

  return (
    <div className="App">
      <SearchForm
        fields={["source", "destination"]}
        handleSubmitApp={handleSubmitApp}
      />
      <Tabs style={{ margin: 10 }} onChange={callback} activeKey={activeKey}>
        <TabPane tab="Map" key="1">
          <ShowMap
            source={state.source}
            destination={state.destination}
            stops={stopsForMap}
            centreON={centre}
          />
        </TabPane>

        <TabPane tab="Connections" key="2">
          {dueTimes && (
            <Button
              style={{ margin: 20 }}
              type="submit"
              onClick={() => Sort(1)}
            >
              Sort by steps
            </Button>
          )}
          {dueTimes && (
            <Button
              style={{ margin: 20 }}
              type="submit"
              onClick={() => Sort(-1)}
            >
              Sort by steps
            </Button>
          )}
          {dueTimes &&
            dueTimes.map((dueTime, i) => <Route key={i} dueTimes={dueTime} />)}
        </TabPane>

        <TabPane tab="Locations" key="3">
          Locations
        </TabPane>
        <TabPane tab="Real Time" key="4">
          {realTimeData.length > 1 && (
            <RealTimeInfo realTimeData={realTimeData}></RealTimeInfo>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
