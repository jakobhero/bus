import React, { useState } from "react";

import "../search.css";

import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import TramIcon from "@material-ui/icons/Tram";

import { Card, Timeline } from "antd";
import "antd/dist/antd.css";

const Route = (tripTimes) => {
  const tripTime = tripTimes.tripTimes;
  const [showMore, setShowMore] = useState(false);
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

  return (
    <Card onClick={() => setShowMore(!showMore)} hoverable>
      <span>
        {departTime}
        <span> - </span>
        {arriveTime}
        <span>
          (duration
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
      {showMore && (
        <div>
          <Timeline mode={"left"}>
            {tripTime.steps.map((step, i) => (
              <Timeline.Item
                key={i}
                label={
                  new Date(step.time).getHours() +
                  ":" +
                  (new Date(step.time).getMinutes() < 10 ? "0" : "") +
                  new Date(step.time).getMinutes()
                }
                color={tripTime.transit_index.includes(i) ? "blue" : "green"}
              >
                <p>
                  {i < 1 ? tripTime.start.address : ""}

                  {tripTime.transit_index.includes(i) &
                  !tripTime.transit_index.includes(i - 1)
                    ? step.transit.dep.name
                    : ""}

                  {tripTime.transit_index.includes(i) &
                  tripTime.transit_index.includes(i - 1)
                    ? step.transit.dep.name
                    : ""}

                  {!tripTime.transit_index.includes(i) &
                  tripTime.transit_index.includes(i - 1)
                    ? tripTime.steps[i - 1].transit.arr.name
                    : ""}
                </p>
                <p>
                  {tripTime.transit_index.includes(i) ? (
                    <DirectionsBusIcon style={{ color: "blue" }} />
                  ) : (
                    ""
                  )}
                  {tripTime.transit_index.includes(i) ? step.transit.route : ""}

                  {!tripTime.transit_index.includes(i) ? (
                    <DirectionsWalkIcon style={{ color: "blue" }} />
                  ) : (
                    ""
                  )}
                </p>
              </Timeline.Item>
            ))}
            <Timeline.Item label={arriveTime}>
              {tripTime.end.address}
            </Timeline.Item>
          </Timeline>
        </div>
      )}
    </Card>
  );
};

export default Route;
