import React, { useState } from "react";
import Route from "./route";
import { Col, Timeline, Row } from "antd";
import ReactHtmlParser from "react-html-parser";

import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";

import TramIcon from "@material-ui/icons/Tram";
import { ExpandAltOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Divider } from "antd";

const AllRoutes = ({ tripTimes, setDirections, index, setIndex }) => {
  const [showMore, setShowMore] = useState(false);
  return (
    <div>
      {tripTimes.length < 1 && (
        <div>
          <h2>Choose a source and destination</h2>
          <img
            src="./bus.svg"
            alt="bus"
            width="10%"
            height="10%"
            style={{ marginRight: "10px" }}
          />
        </div>
      )}
      <Row>
        <Col flex={1}>
          {tripTimes.length > 0 &&
            tripTimes.map((dueTime, i) => (
              // make cards for each alternative route
              <Route
                key={i}
                tripTime={dueTime}
                setDirections={setDirections}
                setIndex={setIndex}
                index={index}
                i={i}
              />
            ))}
          <br />
        </Col>
        {tripTimes.length > 0 && (
          <Col flex={4}>
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
                    // blue if transit, green if walking
                    tripTimes[index].transit_index.includes(i)
                      ? "blue"
                      : "green"
                  }
                >
                  <p>
                    {
                      // first show the start address
                      i < 1 ? tripTimes[index].start.address : ""
                    }

                    {
                      // if this step is transit, else nothing
                      tripTimes[index].transit_index.includes(i) & (i > 0)
                        ? step.transit.dep.name
                        : ""
                    }

                    {
                      // if this step isnt transit and the last was show previous arrival name, else nothing
                      !tripTimes[index].transit_index.includes(i) &
                      tripTimes[index].transit_index.includes(i - 1)
                        ? tripTimes[index].steps[i - 1].transit.arr.name
                        : ""
                    }
                  </p>
                  <p>
                    {/* The inside */}
                    {tripTimes[index].transit_index.includes(i) ? (
                      step.transit.type === "BUS" ? (
                        <DirectionsBusIcon style={{ color: "blue" }} />
                      ) : (
                        <TramIcon style={{ color: "blue" }} />
                      )
                    ) : (
                      ""
                    )}
                    {tripTimes[index].transit_index.includes(i) ? (
                      step.transit.route
                    ) : (
                      <div>
                        <DirectionsWalkIcon style={{ color: "blue" }} />
                        <ExpandAltOutlined
                          style={{ fontSize: "25px", marginLeft: "30px" }}
                          onClick={() => setShowMore(!showMore)}
                        />
                        {showMore &&
                          step.directions.map((direction) => (
                            <div>
                              {ReactHtmlParser(direction)}
                              <Divider />
                            </div>
                          ))}
                      </div>
                    )}
                  </p>
                </Timeline.Item>
              ))}
              {/* Destination timeline element */}
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
