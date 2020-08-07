import React from "react";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import DeleteIcon from "@material-ui/icons/Delete";
import Watch from "@material-ui/icons/WatchLaterOutlined";
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
  height: "160px",
  textAlign: "center",
  maxWidth: "50vw",
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
  setSearchVal,
}) => {
  function handleClick(stopid, stopName) {
    setRealTime(stopid, stopName);
    setStopsForMap([]);
  }

  function handleDelete(stopid) {
    delCookie(stopid);
    setFavStops({ fullname: getStopNames(), stopsids: getStopNums() });
  }

  function handleClickAdd(val) {
    // transfer to the map tab, shows the address and near by bus stops
    // once click the address in the favourites tab
    setSearchVal(getAddressByVal(val));
    let newFields = { ...state };
    let newSource = {
      val: getAddressByVal(val),
      lat: parseFloat(getAddressByVal(val + "Lat")),
      lng: parseFloat(getAddressByVal(val + "Lng")),
    };
    newFields["source"] = newSource;
    newFields["destination"] = "";
    newFields["time"] = "";
    clearMap();
    axios
      .get(
        "/api/nearestneighbor?lat=" + newSource.lat + "&lng=" + newSource.lng
      )
      .then((res) => {
        if (res.statusText === "OK") {
          setStopsForMap(res.data.stops);
          setActiveKey("map");
        }
      })
      .catch(console.log);
    setState(newFields);
  }

  return (
    <div>
      <div>
        <Card
          title="Favorite Stops"
          headStyle={{ backgroundColor: "#1b55db", color: "white" }}
        >
          {favStops.fullname.map((item, index) => (
            <Card.Grid
              key={index}
              style={gridStyle}
              hoverable
              className="stopsCard"
            >
              <CardContent>
                <Typography>{item}</Typography>
                <Typography>{favStops.stopsids[index]}</Typography>
                <Tooltip className="tooltip" title="Real Time Info">
                  <Watch
                    fontSize="large"
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
