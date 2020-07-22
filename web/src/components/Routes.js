import * as React from "react";
//import "./styles.css";
import moment from "moment";
import { Card } from "antd";
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { Popover, Button } from 'antd';
const content = (
    <div>
      <p>Content</p>
      <p>Content</p>
    </div>
  );
const dueTimes = [
  {
    distance: 6113,
    start: {
      time: moment().format("2020 7 1, 14, 38, 9"),
      address: "University College Dublin, Belfield, Dublin 4, Ireland",
      location: {
        lat: 53.30713120000001,
        lng: -6.220312
      }
    },
    end: {
      time: moment().format("2020 7 1, 15, 2, 8"),
      address: "College Green, Dublin 2, Ireland",
      location: {
        lat: 53.3443633,
        lng: -6.2593112
      }
    },
    steps: [
      {
        distance: 347,
        duration: 244,
        start: {
          lat: 53.30713120000001,
          lng: -6.220312
        },
        stop: {
          lat: 53.309375,
          lng: -6.2187873
        },
        mode: "WALKING"
      },
      {
        distance: 5445,
        duration: 968,
        start: {
          lat: 53.3094124,
          lng: -6.218878399999999
        },
        stop: {
          lat: 53.3404818,
          lng: -6.2585706
        },
        mode: "TRANSIT",
        transit: {
          dep: {
            name: "UCD N11 Entrance, stop 768",
            time: moment().format("2020 7 1, 14, 42, 13")
          },
          arr: {
            name: "Dawson Street, stop 792",
            time: moment().format("2020 7 1, 14, 58, 21")
          },
          headsign: "Ongar",
          type: "Dublin Bus",
          route: "39a"
        }
      },
      {
        distance: 321,
        duration: 226,
        start: {
          lat: 53.34212669999999,
          lng: -6.258003599999999
        },
        stop: {
          lat: 53.3443633,
          lng: -6.2593112
        },
        mode: "WALKING"
      }
    ]
  }
];

export default function App() {
  return (
    <div className="App">
      <p>Hello React Object Output</p>
      {dueTimes.map(item => {
        return (
          <>
            <Card>
                Distance : {item.distance}</Card>
                <div>
                {item.steps.map((step, i) => {
                  return (
                    <div key={i}>
                        
                      <Card style={{  color: "black", fontSize: 30 }}>
                     <DirectionsWalkIcon style={{ color: "blue" }}/>
                     <ArrowForwardIosIcon/>
                     <DirectionsBusIcon style={{ color: "blue" }}/> 
                     {step.transit?.route}
                     <ArrowForwardIosIcon/>
                     <DirectionsWalkIcon/> </Card>
                      
                      {/* <p>Step mode: {step.mode}</p>
                      <p>Step Distance: {step.distance}</p>
                      <p>Step duration: {step.duration}</p> */}
                      {step.transit && (
                        <div>
                          <h5 style={{ background: "red", color: "white" }}>Transit</h5>
                          <p style={{ background: "yellow", color: "black" }}>Type: {step.transit?.type}</p>
                          <p style={{ background: "yellow", color: "black" }}>headsign: {step.transit?.headsign}</p>
                          <p style={{ background: "yellow", color: "black" }}>dep.name: {step.transit?.dep.name}</p>
                          <p style={{ background: "yellow", color: "black" }}>dep.time: {step.transit?.dep.time}</p>
                          <p style={{ background: "yellow", color: "black" }}>arr.name: {step.transit?.arr.name}</p>
                          <p style={{ background: "yellow", color: "black" }}>arr.time: {step.transit?.arr.time}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            <Card>
              <h3>Start </h3>
              <p>Start Time: {item.start.time} </p>
              <p>Start address: {item.start.address} </p>
              <p>
                Start location: {item.start.location.lat} -{" "}
                {item.start.location.lng}{" "}
              </p>
            </Card>
            <div>
              <h3>End </h3>
              <p>Start Time: {item.end.time} </p>
              <p>Start address: {item.end.address} </p>
              <p>
                Start location: {item.end.location.lat} -{" "}
                {item.end.location.lng}{" "}
              </p>
            </div>
            <div>
              <h3>steps </h3>
              
            </div>
          </>
        );
      })}
    </div>
  );
}