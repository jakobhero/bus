import React, { useState } from "react";
import axios from "axios";

function RealTimeInfo() {
  const [stop, setStop] = useState("");
  const [dueTimes, setDueTimes] = useState([]);

  function getData() {
    axios
      .get("http://localhost/realtime?stopid=" + stop)
      .then((res) => {
        setDueTimes(res.data);
      })
      .catch(console.log);
  }
  return (
    <div className="search-location-input">
      <div className="search">
        <input
          className="search-input"
          onChange={(event) => setStop(event.target.value)}
          placeholder="Enter a bus stop"
          value={stop}
        />
        <button onClick={getData}>Click here</button>
      </div>

      <table>
        <thead>
          {dueTimes.length > 1 && (
            <tr>
              <td>Route</td>
              <td>Destination</td>
              <td>Due</td>
            </tr>
          )}
        </thead>
        <tbody>
          {dueTimes.map((dueTime, i) => (
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
    </div>
  );
}

export default RealTimeInfo;
