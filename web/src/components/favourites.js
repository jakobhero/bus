import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import DeleteIcon from "@material-ui/icons/Delete";
import { HistoryOutlined } from "@ant-design/icons";
import {
  getStopNames,
  getStopNums,
  getAddressByVal,
  delCookie,
} from "./cookies";
import axios from "axios";
import { Card } from "antd";
import "../css/fav.css";
import Tooltip from "@material-ui/core/Tooltip";

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
  function handleClick(stopid, stopName) {
    setRealTime(stopid, stopName);
  }

  function handleDelete(stopid) {
    delCookie(stopid);
    setFavStops({ fullname: getStopNames(), stopsids: getStopNums() });
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
        <Card
          title="Favorite Stops"
          headStyle={{ backgroundColor: "#1b55db", color: "white" }}
        >
          {favStops.fullname.map((item, index) => (
            <Card.Grid style={gridStyle} hoverable className="stopsCard">
              <CardContent>
                <Typography>{item}</Typography>
                <Typography>{favStops.stopsids[index]}</Typography>
                <Tooltip className="tooltip" title="Real Time Info">
                  <HistoryOutlined
                    onClick={() => handleClick(favStops.stopsids[index], item)}
                    className="realTimeIcon"
                    style={{ fontSize: "16px" }}
                  />
                </Tooltip>
                <Tooltip className="tooltip" title="Remove">
                  <DeleteIcon
                    onClick={() => handleDelete(favStops.stopsids[index])}
                    className="delete"
                  />
                </Tooltip>
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
