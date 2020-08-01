import React, { useState } from "react";

import "../css/search.css";

import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import TramIcon from "@material-ui/icons/Tram";

import { Card } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";

import { findPoly } from "./polylines.js";

const Route = ({ tripTime, setDirections, setIndex, index }) => {
  let startTime = new Date(tripTime.start.time * 1000);
  let endTime = new Date(tripTime.end.time * 1000);
  let time = tripTime.start.time * 1000;

  // loops through json and adds a time value to each step, should be moved to backend
  for (var i = 0; i < tripTime.steps.length; i++) {
    tripTime.steps[i]["time"] = time;
    time += tripTime.steps[i].duration * 1000;
  }
  let departTime =
    startTime.getHours() +
    ":" +
    (startTime.getMinutes() < 10 ? "0" : "") +
    startTime.getMinutes();
  let arriveTime =
    endTime.getHours() +
    ":" +
    (endTime.getMinutes() < 10 ? "0" : "") +
    endTime.getMinutes();

  const handleClick = () => {
    setIndex(index);
    setDirections(findPoly(tripTime));
  };
  return (
    <Card onClick={handleClick} hoverable>
      <span>
        {departTime}
        <span> - </span>
        {arriveTime}
        <span>
          (<ClockCircleOutlined style={{ fontSize: "14px" }} />
          {" " + Math.round(tripTime.duration / 60)}
          m)
        </span>
      </span>
      <div>
        <DirectionsWalkIcon style={{ color: "blue" }} />
        {tripTime.transit_index.map((index) => (
          <span key={index}>
            <ArrowForwardIosIcon />
            {tripTime.steps[index].transit.type === "BUS" ? (
              <DirectionsBusIcon style={{ color: "blue" }} />
            ) : (
              <TramIcon style={{ color: "blue" }} />
            )}
            {tripTime.steps[index].transit.type === "BUS"
              ? tripTime.steps[index].transit.route
              : ""}
          </span>
        ))}
        <ArrowForwardIosIcon />
        <DirectionsWalkIcon style={{ color: "blue" }} />
      </div>
    </Card>
  );
};

export default Route;
