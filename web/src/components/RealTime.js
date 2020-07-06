import React, { useState } from "react";
// import axios from "axios";

const RealTimeInfo = (realTimeData) => {
  realTimeData = realTimeData.realTimeData;
  return (
    <div className="search-location-input">
      {realTimeData.length > 1 ? (
        <table>
          <thead>
            <tr>
              <td>Route</td>
              <td>Destination</td>
              <td>Due</td>
            </tr>
          </thead>
          <tbody>
            {realTimeData.map((dueTime, i) => (
              <tr
                className="routes"
                key={i}
                // onClick={(event) => onSelectSuggestion(suggestion, event)}
              >
                <td>{dueTime.route}</td>
                <td>{dueTime.destination}</td>
                <td>{dueTime.duetime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        "hey"
      )}
    </div>
  );
};

export default RealTimeInfo;
