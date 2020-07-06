import React, { useState } from "react";

import "../search.css";

import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

import { Card, Timeline } from "antd";
import "antd/dist/antd.css";

const Route = (dueTimes) => {
  const dueTime = dueTimes.dueTimes;
  const [showMore, setShowMore] = useState(false);
  let startTime = new Date(dueTime.start.time * 1000);
  let endTime = new Date(dueTime.end.time * 1000);
  let time = dueTime.start.time * 1000;

  for (var i = 0; i < dueTime.steps.length; i++) {
    dueTime.steps[i]["time"] = time;
    time += dueTime.steps[i].duration * 1000;
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
          {" " + Math.round(dueTime.duration / 60)}
          m)
        </span>
      </span>
      <div>
        <DirectionsWalkIcon style={{ color: "blue" }} />
        {dueTime.bus_index.map((index) => (
          <span key={index}>
            <ArrowForwardIosIcon />
            <DirectionsBusIcon style={{ color: "blue" }} />
            {dueTime.steps[index].transit.route}
          </span>
        ))}
        <ArrowForwardIosIcon />
        <DirectionsWalkIcon style={{ color: "blue" }} />
      </div>
      {showMore && (
        <div>
          <Timeline mode={"left"}>
            {dueTime.steps.map((step, i) => (
              <Timeline.Item
                key={i}
                label={
                  new Date(step.time).getHours() +
                  ":" +
                  (new Date(step.time).getMinutes() < 10 ? "0" : "") +
                  new Date(step.time).getMinutes()
                }
                color={dueTime.bus_index.includes(i) ? "blue" : "green"}
              >
                <p>
                  {i < 1 ? dueTime.start.address : ""}

                  {dueTime.bus_index.includes(i) &
                  !dueTime.bus_index.includes(i - 1)
                    ? step.transit.dep.name
                    : ""}

                  {dueTime.bus_index.includes(i) &
                  dueTime.bus_index.includes(i - 1)
                    ? step.transit.dep.name
                    : ""}

                  {!dueTime.bus_index.includes(i) &
                  dueTime.bus_index.includes(i - 1)
                    ? dueTime.steps[i - 1].transit.arr.name
                    : ""}
                </p>
                <p>
                  {dueTime.bus_index.includes(i) ? (
                    <DirectionsBusIcon style={{ color: "blue" }} />
                  ) : (
                    ""
                  )}
                  {dueTime.bus_index.includes(i) ? step.transit.route : ""}

                  {!dueTime.bus_index.includes(i) ? (
                    <DirectionsWalkIcon style={{ color: "blue" }} />
                  ) : (
                    ""
                  )}
                </p>
              </Timeline.Item>
            ))}
            <Timeline.Item label={arriveTime}>
              {dueTime.end.address}
            </Timeline.Item>
          </Timeline>
        </div>
      )}
    </Card>
  );
};

export default Route;
