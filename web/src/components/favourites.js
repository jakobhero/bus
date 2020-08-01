import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import DeleteIcon from "@material-ui/icons/Delete";
import { HistoryOutlined } from "@ant-design/icons";
import {
  getStopNames,
  getIdByName,
  getAddressByVal,
  delCookie,
} from "./cookies";
import axios from "axios";
import { Card } from "antd";
import "../css/fav.css";

const gridStyle = {
  width: "25%",
  height: "150px",
  textAlign: "center",
  minWidth: "150px",
};

const Favourites = ({
  setRealTime,
  clearMap,
  setStopsForMap,
  setActiveKey,
  setState,
  state,
  favStops,
  setFavStops,
}) => {
  function handleClick(stopName) {
    console.log(stopName);
    // transfer to the real-time tab once click the stop id in the favourites tab
    var stopid = getIdByName(String(stopName).trim());
    setRealTime(stopid.trim(), stopName);
  }

  function handleDelete(stopName) {
    console.log(stopName);
    var stopid = getIdByName(String(stopName).trim());
    delCookie(stopid.trim());
    setFavStops(getStopNames());
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
        "/api/nearestneighbor?lat=" +
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
      <div>
        <Card title="Favorite Stops" headStyle={{ backgroundColor: "#1b55db" }}>
          {favStops.map((item) => (
            <Card.Grid style={gridStyle} hoverable className="stopsCard">
              <CardContent>
                <Typography>{item}</Typography>
                <HistoryOutlined
                  onClick={() => handleClick(item)}
                  className="realTimeIcon"
                  style={{ fontSize: "16px" }}
                />
                <DeleteIcon
                  onClick={() => handleDelete(item)}
                  className="delete"
                />
              </CardContent>
            </Card.Grid>
          ))}
        </Card>
      </div>
      <Card
        hoverable
        onClick={() => handleClickAdd("Home")}
        title="Home Address"
        headStyle={{ backgroundColor: "#fea100" }}
      >
        <CardContent>
          <Typography variant="h5" component="h2">
            {getAddressByVal("Home")}
          </Typography>
        </CardContent>
      </Card>
      <Card
        hoverable
        onClick={() => handleClickAdd("Work")}
        title="Work Address"
        headStyle={{ backgroundColor: "#fea100" }}
      >
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
