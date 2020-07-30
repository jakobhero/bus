import React from "react";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import { getStopNames, getIdByName, getAddressByVal } from "./cookies";
import axios from "axios";
import { Card } from "antd";

const Favourites = ({
  setRealTime,
  clearMap,
  setStopsForMap,
  setActiveKey,
  setState,
  state,
}) => {
  function handleClick(stopName) {
    // transfer to the real-time tab once click the stop id in the favourites tab
    var stopid = getIdByName(String(stopName).trim());
    setRealTime(stopid.trim());
    console.log(stopid);
    console.log(getStopNames());
  }

  function handleClickAdd(Val) {
    // transfer to the map tab, shows the address and near by bus stops 
    // once click the address in the favourites tab
    let newFields = { ...state };
    let test = {};
    test["val"] = getAddressByVal(Val);
    test["lat"] = parseFloat(getAddressByVal(Val + "Lat"));
    test["lng"] = parseFloat(getAddressByVal(Val + "Lng"));
    newFields["source"] = test;
    newFields["destination"] = "";
    newFields["time"] = "";
    clearMap();
    axios
      .get(
        "http://localhost/api/nearestneighbor?lat=" +
          getAddressByVal(Val + "Lat") +
          "&lng=" +
          getAddressByVal(Val + "Lng")
      )
      .then((res) => {
        console.log(res);
        if (res.statusText === "OK") {
          setStopsForMap(res.data.stops);
          setActiveKey("map");
        }
      })
      .catch(console.log);
    setState(newFields);
    console.log("new field for fav", newFields);
  }

  return (
    <div>
      Favorite Locations:
      <div>
        {getStopNames().map((item) => (
          <Card hoverable onClick={() => handleClick(item)}>
            <CardContent>
              <Typography variant="h5" component="h2">
                {item}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
      Home Address:
      <Card hoverable onClick={() => handleClickAdd("Home")}>
        <CardContent>
          <Typography variant="h5" component="h2">
            {getAddressByVal("Home")}
          </Typography>
        </CardContent>
      </Card>
      Work Address:
      <Card hoverable onClick={() => handleClickAdd("Work")}>
        <CardContent>
          <Typography variant="h5" component="h2">
            {getAddressByVal("Work")}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default Favourites;
