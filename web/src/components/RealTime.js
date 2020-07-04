import React, { useState, useEffect, useRef } from "react";

const dueTimes = [
  { route: "39A", duetime: "5", destination: "Ongar" },
  { route: "39A", duetime: "14", destination: "Ongar" },
  { route: "39A", duetime: "28", destination: "Ongar" },
  { route: "39", duetime: "29", destination: "Ongar" },
];

function RealTimeInfo() {
  const [stop, setStop] = useState("");
  // const [dueTimes2, setDueTimes] = useState("");
  const stopRef = useRef(null);

  // function hey() {
  //   fetch(
  //     "https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=1899"
  //   )
  //     .then((res) => console.log(res))
  //     .then((data) => {
  //       console.log(data);
  //       // setDueTimes(data);
  //     })
  //     .catch(console.log);
  // }

  return (
    <div className="search-location-input">
      <div className="search">
        <input
          className="search-input"
          ref={stopRef}
          onChange={(event) => setStop(event.target.value)}
          placeholder="Enter a bus stop"
          value={stop}
        />
        {/* <button onClick={hey}>Click here</button> */}
      </div>

      <table>
        <thead>
          <tr>
            <td>Route</td>
            <td>Destination</td>
            <td>Due</td>
          </tr>
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
