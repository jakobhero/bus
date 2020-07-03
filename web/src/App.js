import "./App.css";
import React, { Component } from "react";
import Route from "./components/route";
import SearchForm from "./components/searchForm";
import "antd/dist/antd.css";

import ShowMap from "./components/ShowMap";
import RealTimeInfo from "./components/RealTime";

// import { Layout, Menu, Input, Breadcrumb, DatePicker } from "antd";
import { Tabs, Checkbox } from "antd";

const { TabPane } = Tabs;
// const { SubMenu } = Menu;
// const { Header, Content, Sider } = Layout;

function callback(key) {
  console.log(key);
}
// function onChange(e) {
//   console.log(`checked = ${e.target.checked}`);
// }

const dueTimes = [
  {
    distance: 5343,
    start: {
      time: 1593770220,
      address: "University College Dublin, Belfield, Dublin 4, Ireland",
      location: {
        lat: 53.30713120000001,
        lng: -6.220312,
      },
    },
    end: {
      time: 1593771617,
      address: "College Green, Dublin 2, Ireland",
      location: {
        lat: 53.3443633,
        lng: -6.2593112,
      },
    },
    bus_index: [1],
    steps: [
      {
        distance: 347,
        duration: 244,
        start: {
          lat: 53.30713120000001,
          lng: -6.220312,
        },
        stop: {
          lat: 53.309375,
          lng: -6.2187873,
        },
        mode: "WALKING",
      },
      {
        distance: 4675,
        duration: 926,
        start: {
          lat: 53.3094124,
          lng: -6.218878399999999,
        },
        stop: {
          lat: 53.3404818,
          lng: -6.2585706,
        },
        mode: "TRANSIT",
        transit: {
          dep: {
            name: "UCD N11 Entrance, stop 768",
            time: 1593770464,
          },
          arr: {
            name: "Dawson Street, stop 792",
            time: 1593771390,
          },
          headsign: "Phoenix Pk",
          type: "Dublin Bus",
          route: "46a",
        },
      },
      {
        distance: 321,
        duration: 226,
        start: {
          lat: 53.34212669999999,
          lng: -6.258003599999999,
        },
        stop: {
          lat: 53.3443633,
          lng: -6.2593112,
        },
        mode: "WALKING",
      },
    ],
  },
  {
    distance: 6113,
    start: {
      time: 1593770269,
      address: "University College Dublin, Belfield, Dublin 4, Ireland",
      location: {
        lat: 53.30713120000001,
        lng: -6.220312,
      },
    },
    end: {
      time: 1593771666,
      address: "College Green, Dublin 2, Ireland",
      location: {
        lat: 53.3443633,
        lng: -6.2593112,
      },
    },
    bus_index: [1],
    steps: [
      {
        distance: 347,
        duration: 244,
        start: {
          lat: 53.30713120000001,
          lng: -6.220312,
        },
        stop: {
          lat: 53.309375,
          lng: -6.2187873,
        },
        mode: "WALKING",
      },
      {
        distance: 5445,
        duration: 926,
        start: {
          lat: 53.3094124,
          lng: -6.218878399999999,
        },
        stop: {
          lat: 53.3404818,
          lng: -6.2585706,
        },
        mode: "TRANSIT",
        transit: {
          dep: {
            name: "UCD N11 Entrance, stop 768",
            time: 1593770513,
          },
          arr: {
            name: "Dawson Street, stop 792",
            time: 1593771439,
          },
          headsign: "Ongar",
          type: "Dublin Bus",
          route: "39a",
        },
      },
      {
        distance: 321,
        duration: 226,
        start: {
          lat: 53.34212669999999,
          lng: -6.258003599999999,
        },
        stop: {
          lat: 53.3443633,
          lng: -6.2593112,
        },
        mode: "WALKING",
      },
    ],
  },
  {
    distance: 5343,
    start: {
      time: 1593770648,
      address: "University College Dublin, Belfield, Dublin 4, Ireland",
      location: {
        lat: 53.30713120000001,
        lng: -6.220312,
      },
    },
    end: {
      time: 1593772015,
      address: "College Green, Dublin 2, Ireland",
      location: {
        lat: 53.3443633,
        lng: -6.2593112,
      },
    },
    bus_index: [1],
    steps: [
      {
        distance: 347,
        duration: 244,
        start: {
          lat: 53.30713120000001,
          lng: -6.220312,
        },
        stop: {
          lat: 53.309375,
          lng: -6.2187873,
        },
        mode: "WALKING",
      },
      {
        distance: 4675,
        duration: 896,
        start: {
          lat: 53.3094124,
          lng: -6.218878399999999,
        },
        stop: {
          lat: 53.3404818,
          lng: -6.2585706,
        },
        mode: "TRANSIT",
        transit: {
          dep: {
            name: "UCD N11 Entrance, stop 768",
            time: 1593770892,
          },
          arr: {
            name: "Dawson Street, stop 792",
            time: 1593771788,
          },
          headsign: "Heuston Station",
          type: "Dublin Bus",
          route: "145",
        },
      },
      {
        distance: 321,
        duration: 226,
        start: {
          lat: 53.34212669999999,
          lng: -6.258003599999999,
        },
        stop: {
          lat: 53.3443633,
          lng: -6.2593112,
        },
        mode: "WALKING",
      },
    ],
  },
  {
    distance: 5343,
    start: {
      time: 1593770668,
      address: "University College Dublin, Belfield, Dublin 4, Ireland",
      location: {
        lat: 53.30713120000001,
        lng: -6.220312,
      },
    },
    end: {
      time: 1593772094,
      address: "College Green, Dublin 2, Ireland",
      location: {
        lat: 53.3443633,
        lng: -6.2593112,
      },
    },
    bus_index: [1],
    steps: [
      {
        distance: 347,
        duration: 244,
        start: {
          lat: 53.30713120000001,
          lng: -6.220312,
        },
        stop: {
          lat: 53.309375,
          lng: -6.2187873,
        },
        mode: "WALKING",
      },
      {
        distance: 4675,
        duration: 955,
        start: {
          lat: 53.3094124,
          lng: -6.218878399999999,
        },
        stop: {
          lat: 53.3404818,
          lng: -6.2585706,
        },
        mode: "TRANSIT",
        transit: {
          dep: {
            name: "UCD N11 Entrance, stop 768",
            time: 1593770912,
          },
          arr: {
            name: "Dawson Street, stop 792",
            time: 1593771867,
          },
          headsign: "Ikea",
          type: "Dublin Bus",
          route: "155",
        },
      },
      {
        distance: 321,
        duration: 226,
        start: {
          lat: 53.34212669999999,
          lng: -6.258003599999999,
        },
        stop: {
          lat: 53.3443633,
          lng: -6.2593112,
        },
        mode: "WALKING",
      },
    ],
  },
];

class App extends Component {
  state = { val: "" };

  render() {
    return (
      <div className="autocomplete-wrapper">
        <h3>Search for a bus stop number</h3>
        <SearchForm fields={["source", "destination"]}></SearchForm>
        <Tabs style={{ margin: 10 }} defaultActiveKey="1" onChange={callback}>
          <TabPane tab="Map" key="1">
            <ShowMap></ShowMap>
          </TabPane>
          <TabPane tab="Connections" key="2">
            {dueTimes.map((dueTime, i) => (
              <Route key={i} dueTimes={dueTime} />
            ))}
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
  }
}

export default App;
