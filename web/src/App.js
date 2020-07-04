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
// const { SubMenu } = Menu;
// const { Header, Content, Sider } = Layout;

function callback(key) {
  console.log(key);
}
// function onChange(e) {
//   console.log(`checked = ${e.target.checked}`);
// }

const App = () => {
  const [state, setState] = React.useState({});
  const [dueTimes, setDueTimes] = React.useState([]);
  const [centre, setCentre] = React.useState({
    lat: 53.35014,
    lng: -6.266155,
  });
  const handleSubmitApp = (source, dest) => {
    let newFields = { ...state };
    newFields["source"] = source;
    newFields["destination"] = dest;

    axios
      .get("http://localhost/directions?dep=" + source.val + "&arr=" + dest.val)
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
  };

  const Sort = () => {
    const dueTimesCopy = [...dueTimes];
    dueTimesCopy.sort((a, b) =>
      a.steps.length > b.steps.length
        ? 1
        : b.steps.length > a.steps.length
        ? -1
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
      <Tabs style={{ margin: 10 }} defaultActiveKey="1" onChange={callback}>
        <TabPane tab="Map" key="1">
          <ShowMap
            source={state.source}
            destination={state.destination}
            stops={[]}
            centreON={centre}
          />
        </TabPane>
        <TabPane tab="Connections" key="2">
          {dueTimes && (
            <Button style={{ margin: 20 }} type="submit" onClick={Sort}>
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
          <RealTimeInfo></RealTimeInfo>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
