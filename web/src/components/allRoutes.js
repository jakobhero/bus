import React from "react";
import Route from "./route";

const AllRoutes = ({ tripTimes, setDirections }) => {
  return (
    <div>
      {tripTimes.length > 0 &&
        tripTimes.map((dueTime, i) => (
          <Route key={i} tripTime={dueTime} setDirections={setDirections} />
        ))}
      {tripTimes.length < 1 && <p>Choose a source and destination</p>}
    </div>
  );
};

export default AllRoutes;
