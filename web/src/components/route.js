import React, { useState } from "react";

import "../search.css";

import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

import { Card } from "antd";
import "antd/dist/antd.css";

const Route = (dueTimes, test) => {
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
          {" " + Math.round((dueTime.end.time - dueTime.start.time) / 60)}
          m)
        </span>
      </span>
      <div>
        <DirectionsWalkIcon style={{ color: "blue" }} />
        <ArrowForwardIosIcon />
        <DirectionsBusIcon style={{ color: "blue" }} />
        {dueTime.steps[1].transit.route}
        <ArrowForwardIosIcon />
        <DirectionsWalkIcon style={{ color: "blue" }} />
      </div>
      {showMore && (
        <div>
          <table>
            <tbody>
              {dueTime.steps.map((step, i) => (
                <tr key={i}>
                  <td>
                    {new Date(step.time).getHours() +
                      ":" +
                      (new Date(step.time).getMinutes() < 10 ? "0" : "") +
                      new Date(step.time).getMinutes()}
                  </td>
                  <td>
                    {i < 1 ? dueTime.start.address : ""}
                    {dueTime.bus_index.includes(i) ? step.transit.dep.name : ""}
                    {dueTime.bus_index.includes(i - 1) &
                    !dueTime.bus_index.includes(i)
                      ? dueTime.steps[i - 1].transit.arr.name
                      : ""}

                    {/* both can be called if bus indexs are within one, if that is the case, only can the first one */}
                  </td>
                </tr>
              ))}
              <tr>
                <td>{arriveTime}</td>
                <td>{dueTime.end.address}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default Route;
// {var time = dueTime.start.time}
// dueTime.steps.map((step, i) => {
//           <tr key={i}>
//             {time += step.duration * 1000}
//                 <td>
//                   {new Date(
//                     time
//                   ).getHours() +
//                     ":" +
//                     new Date(
//                       time
//                     ).getMinutes()}
//                 </td>
//                 <td>Help</td>
//               </tr>

// })

{
  /* <tr>
<td>{departTime}</td>
<td>{dueTime.start.address}</td>
</tr>
<tr>
<td>
  {new Date(
    dueTime.start.time + dueTime.steps[0].duration * 1000
  ).getHours() +
    ":" +
    new Date(
      dueTime.start.time + dueTime.steps[0].duration * 1000
    ).getMinutes()}
</td>
<td>{dueTime.steps[1].transit.dep.name}</td>
</tr>
<tr>
<td>
  {new Date(
    dueTime.start.time +
      dueTime.steps[0].duration * 1000 +
      dueTime.steps[1].duration * 1000
  ).getHours() +
    ":" +
    new Date(
      dueTime.start.time +
        dueTime.steps[0].duration * 1000 +
        dueTime.steps[1].duration * 1000
    ).getMinutes()}
</td>
<td>{dueTime.steps[1].transit.arr.name}</td>
</tr>
<tr>
<td>{arriveTime}</td>
<td>{dueTime.end.address}</td>
</tr> */
}
