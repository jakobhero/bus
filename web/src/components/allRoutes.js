import React, { useState } from "react";
import Route from "./route";
import { Col, Timeline, Row } from "antd";

import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import TramIcon from "@material-ui/icons/Tram";
import { ClockCircleOutlined } from "@ant-design/icons";

const AllRoutes = ({ tripTimes, setDirections }) => {
  const [index, setIndex] = useState(0);
  console.log(tripTimes);

  return (
    <div>
      {tripTimes.length < 1 && <p>Choose a source and destination</p>}
      <Row>
        <Col span={8}>
          {tripTimes.length > 0 &&
            tripTimes.map((dueTime, i) => (
              <Route
                key={i}
                tripTime={dueTime}
                setDirections={setDirections}
                setIndex={setIndex}
                index={i}
              />
            ))}
        </Col>
        {tripTimes.length > 0 && (
          <Col>
            <Timeline mode={"left"}>
              {tripTimes[index].steps.map((step, i) => (
                <Timeline.Item
                  key={i}
                  label={
                    new Date(step.time).getHours() +
                    ":" +
                    (new Date(step.time).getMinutes() < 10 ? "0" : "") +
                    new Date(step.time).getMinutes()
                  }
                  color={
                    tripTimes[index].transit_index.includes(i)
                      ? "blue"
                      : "green"
                  }
                >
                  <p>
                    {i < 1 ? tripTimes[index].start.address : ""}

                    {tripTimes[index].transit_index.includes(i) &
                    !tripTimes[index].transit_index.includes(i - 1) &
                    (i > 0)
                      ? step.transit.dep.name
                      : ""}

                    {tripTimes[index].transit_index.includes(i) &
                    tripTimes[index].transit_index.includes(i - 1)
                      ? step.transit.dep.name
                      : ""}

                    {!tripTimes[index].transit_index.includes(i) &
                    tripTimes[index].transit_index.includes(i - 1)
                      ? tripTimes[index].steps[i - 1].transit.arr.name
                      : ""}
                  </p>
                  <p>
                    {tripTimes[index].transit_index.includes(i) ? (
                      step.transit.type === "BUS" ? (
                        <DirectionsBusIcon style={{ color: "blue" }} />
                      ) : (
                        <TramIcon style={{ color: "blue" }} />
                      )
                    ) : (
                      ""
                    )}
                    {tripTimes[index].transit_index.includes(i)
                      ? step.transit.route
                      : ""}

                    {!tripTimes[index].transit_index.includes(i) ? (
                      <DirectionsWalkIcon style={{ color: "blue" }} />
                    ) : (
                      ""
                    )}
                  </p>
                </Timeline.Item>
              ))}
              <Timeline.Item
                label={
                  new Date(tripTimes[index].end.time * 1000).getHours() +
                  ":" +
                  (new Date(tripTimes[index].end.time * 1000).getMinutes() < 10
                    ? "0"
                    : "") +
                  new Date(tripTimes[index].end.time * 1000).getMinutes()
                }
                dot={<ClockCircleOutlined style={{ fontSize: "16px" }} />}
              >
                {tripTimes[index].end.address}
              </Timeline.Item>
            </Timeline>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default AllRoutes;
