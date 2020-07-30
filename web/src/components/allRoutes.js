import React from "react";
import Route from "./route";
import { Card } from "antd";
const AllRoutes = ({ tripTimes, setDirections }) => {
  return (
    <div>
      <Card headStyle={{ backgroundColor: "#1b55db" }}>
        {tripTimes.length > 0 &&
          tripTimes.map((dueTime, i) => (
            <Route key={i} tripTime={dueTime} setDirections={setDirections} />
          ))}
        {tripTimes.length < 1 && <p>Choose a source and destination</p>}
      </Card>
    </div>
  );
};

export default AllRoutes;
