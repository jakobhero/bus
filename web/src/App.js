import "./App.css";
import React, { useState } from "react";
import Route from "./components/route";
import SearchForm from "./components/searchForm";

import ShowMap from "./components/ShowMap";
import RealTimeInfo from "./components/RealTime";

// import { Layout, Menu, Input, Breadcrumb, DatePicker } from "antd";
import { Tabs } from "antd";
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

// const dueTimes = [
//   {
//     distance: 5343,
//     start: {
//       time: 1593770220,
//       address: "University College Dublin, Belfield, Dublin 4, Ireland",
//       location: {
//         lat: 53.30713120000001,
//         lng: -6.220312,
//       },
//     },
//     end: {
//       time: 1593771617,
//       address: "College Green, Dublin 2, Ireland",
//       location: {
//         lat: 53.3443633,
//         lng: -6.2593112,
//       },
//     },
//     bus_index: [1],
//     steps: [
//       {
//         distance: 347,
//         duration: 244,
//         start: {
//           lat: 53.30713120000001,
//           lng: -6.220312,
//         },
//         stop: {
//           lat: 53.309375,
//           lng: -6.2187873,
//         },
//         mode: "WALKING",
//       },
//       {
//         distance: 4675,
//         duration: 926,
//         start: {
//           lat: 53.3094124,
//           lng: -6.218878399999999,
//         },
//         stop: {
//           lat: 53.3404818,
//           lng: -6.2585706,
//         },
//         mode: "TRANSIT",
//         transit: {
//           dep: {
//             name: "UCD N11 Entrance, stop 768",
//             time: 1593770464,
//           },
//           arr: {
//             name: "Dawson Street, stop 792",
//             time: 1593771390,
//           },
//           headsign: "Phoenix Pk",
//           type: "Dublin Bus",
//           route: "46a",
//         },
//       },
//       {
//         distance: 321,
//         duration: 226,
//         start: {
//           lat: 53.34212669999999,
//           lng: -6.258003599999999,
//         },
//         stop: {
//           lat: 53.3443633,
//           lng: -6.2593112,
//         },
//         mode: "WALKING",
//       },
//     ],
//   },
//   {
//     distance: 6113,
//     start: {
//       time: 1593770269,
//       address: "University College Dublin, Belfield, Dublin 4, Ireland",
//       location: {
//         lat: 53.30713120000001,
//         lng: -6.220312,
//       },
//     },
//     end: {
//       time: 1593771666,
//       address: "College Green, Dublin 2, Ireland",
//       location: {
//         lat: 53.3443633,
//         lng: -6.2593112,
//       },
//     },
//     bus_index: [1],
//     steps: [
//       {
//         distance: 347,
//         duration: 244,
//         start: {
//           lat: 53.30713120000001,
//           lng: -6.220312,
//         },
//         stop: {
//           lat: 53.309375,
//           lng: -6.2187873,
//         },
//         mode: "WALKING",
//       },
//       {
//         distance: 5445,
//         duration: 926,
//         start: {
//           lat: 53.3094124,
//           lng: -6.218878399999999,
//         },
//         stop: {
//           lat: 53.3404818,
//           lng: -6.2585706,
//         },
//         mode: "TRANSIT",
//         transit: {
//           dep: {
//             name: "UCD N11 Entrance, stop 768",
//             time: 1593770513,
//           },
//           arr: {
//             name: "Dawson Street, stop 792",
//             time: 1593771439,
//           },
//           headsign: "Ongar",
//           type: "Dublin Bus",
//           route: "39a",
//         },
//       },
//       {
//         distance: 321,
//         duration: 226,
//         start: {
//           lat: 53.34212669999999,
//           lng: -6.258003599999999,
//         },
//         stop: {
//           lat: 53.3443633,
//           lng: -6.2593112,
//         },
//         mode: "WALKING",
//       },
//     ],
//   },
//   {
//     distance: 5343,
//     start: {
//       time: 1593770648,
//       address: "University College Dublin, Belfield, Dublin 4, Ireland",
//       location: {
//         lat: 53.30713120000001,
//         lng: -6.220312,
//       },
//     },
//     end: {
//       time: 1593772015,
//       address: "College Green, Dublin 2, Ireland",
//       location: {
//         lat: 53.3443633,
//         lng: -6.2593112,
//       },
//     },
//     bus_index: [1],
//     steps: [
//       {
//         distance: 347,
//         duration: 244,
//         start: {
//           lat: 53.30713120000001,
//           lng: -6.220312,
//         },
//         stop: {
//           lat: 53.309375,
//           lng: -6.2187873,
//         },
//         mode: "WALKING",
//       },
//       {
//         distance: 4675,
//         duration: 896,
//         start: {
//           lat: 53.3094124,
//           lng: -6.218878399999999,
//         },
//         stop: {
//           lat: 53.3404818,
//           lng: -6.2585706,
//         },
//         mode: "TRANSIT",
//         transit: {
//           dep: {
//             name: "UCD N11 Entrance, stop 768",
//             time: 1593770892,
//           },
//           arr: {
//             name: "Dawson Street, stop 792",
//             time: 1593771788,
//           },
//           headsign: "Heuston Station",
//           type: "Dublin Bus",
//           route: "145",
//         },
//       },
//       {
//         distance: 321,
//         duration: 226,
//         start: {
//           lat: 53.34212669999999,
//           lng: -6.258003599999999,
//         },
//         stop: {
//           lat: 53.3443633,
//           lng: -6.2593112,
//         },
//         mode: "WALKING",
//       },
//     ],
//   },
//   {
//     distance: 5343,
//     start: {
//       time: 1593770668,
//       address: "University College Dublin, Belfield, Dublin 4, Ireland",
//       location: {
//         lat: 53.30713120000001,
//         lng: -6.220312,
//       },
//     },
//     end: {
//       time: 1593772094,
//       address: "College Green, Dublin 2, Ireland",
//       location: {
//         lat: 53.3443633,
//         lng: -6.2593112,
//       },
//     },
//     bus_index: [1],
//     steps: [
//       {
//         distance: 347,
//         duration: 244,
//         start: {
//           lat: 53.30713120000001,
//           lng: -6.220312,
//         },
//         stop: {
//           lat: 53.309375,
//           lng: -6.2187873,
//         },
//         mode: "WALKING",
//       },
//       {
//         distance: 4675,
//         duration: 955,
//         start: {
//           lat: 53.3094124,
//           lng: -6.218878399999999,
//         },
//         stop: {
//           lat: 53.3404818,
//           lng: -6.2585706,
//         },
//         mode: "TRANSIT",
//         transit: {
//           dep: {
//             name: "UCD N11 Entrance, stop 768",
//             time: 1593770912,
//           },
//           arr: {
//             name: "Dawson Street, stop 792",
//             time: 1593771867,
//           },
//           headsign: "Ikea",
//           type: "Dublin Bus",
//           route: "155",
//         },
//       },
//       {
//         distance: 321,
//         duration: 226,
//         start: {
//           lat: 53.34212669999999,
//           lng: -6.258003599999999,
//         },
//         stop: {
//           lat: 53.3443633,
//           lng: -6.2593112,
//         },
//         mode: "WALKING",
//       },
//     ],
//   },
//   {
//     distance: 8235,
//     start: {
//       time: 1593770874,
//       address: "32 Blackhall Pl, Northside, Dublin 7, D07 P2W7, Ireland",
//       location: {
//         lat: 53.34917610000001,
//         lng: -6.2818628,
//       },
//     },
//     end: {
//       time: 1593773465,
//       address: "University College Dublin, Belfield, Dublin 4, Ireland",
//       location: {
//         lat: 53.30713120000001,
//         lng: -6.220312,
//       },
//     },
//     bus_index: [1, 2],
//     steps: [
//       {
//         distance: 165,
//         duration: 118,
//         start: {
//           lat: 53.34917610000001,
//           lng: -6.2818628,
//         },
//         stop: {
//           lat: 53.3477145,
//           lng: -6.2822356,
//         },
//         mode: "WALKING",
//       },
//       {
//         distance: 2904,
//         duration: 799,
//         start: {
//           lat: 53.34770409999999,
//           lng: -6.2821238,
//         },
//         stop: {
//           lat: 53.3399308,
//           lng: -6.255723499999999,
//         },
//         mode: "TRANSIT",
//         transit: {
//           dep: {
//             name: "Smithfield, Blackhall Street ->S",
//             time: 1593770993,
//           },
//           arr: {
//             name: "Kildare Street, stop 747",
//             time: 1593771792,
//           },
//           headsign: "Wilton Terrace",
//           type: "Dublin Bus",
//           route: "37",
//         },
//       },
//       {
//         distance: 4664,
//         duration: 783,
//         start: {
//           lat: 53.3399308,
//           lng: -6.255723499999999,
//         },
//         stop: {
//           lat: 53.3088746,
//           lng: -6.2160812,
//         },
//         mode: "TRANSIT",
//         transit: {
//           dep: {
//             name: "Kildare Street, stop 747",
//             time: 1593772246,
//           },
//           arr: {
//             name: "Booterstown, Woodbine Road",
//             time: 1593773029,
//           },
//           headsign: "Bray",
//           type: "Dublin Bus",
//           route: "155",
//         },
//       },
//       {
//         distance: 502,
//         duration: 436,
//         start: {
//           lat: 53.308889,
//           lng: -6.2158789,
//         },
//         stop: {
//           lat: 53.30713120000001,
//           lng: -6.220312,
//         },
//         mode: "WALKING",
//       },
//     ],
//   },
// ];

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
