import React, { useState } from "react";

import {
  GoogleMap,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import mapStyles from "./mapStyles";
import mapStylesIcons from "./mapStylesIcons";

import Switch from "react-switch";
import { setCookie, saveAddress, delCookie, getAddressByVal } from "./cookies";
import { Button, Modal } from "antd";
import Tooltip from "@material-ui/core/Tooltip";

import Replay from "@material-ui/icons/Replay";
import Watch from "@material-ui/icons/WatchLaterOutlined";
import Cloud from "@material-ui/icons/CloudOutlined";
import StarIcon from "@material-ui/icons/Star";
import StarBorderOutlinedIcon from "@material-ui/icons/StarBorderOutlined";
import Home from "@material-ui/icons/Home";
import HomeOutlined from "@material-ui/icons/HomeOutlined";
import Work from "@material-ui/icons/Work";
import WorkOutlined from "@material-ui/icons/WorkOutline";
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";

import ReactWeather from "react-open-weather";
//Optional include of the default css styles
import "react-open-weather/lib/css/ReactWeather.css";
import "../css/map.css";

// https://www.youtube.com/watch?v=SySVBV_jcCM

const mapContainerStyle = {
  height: "60vh",
};

const centre = {
  lat: 53.35014,
  lng: -6.266155,
};
function Locate({ panTo, getStopsByCoords }) {
  return (
    <Tooltip className="tooltip" title="Current Location">
      <div
        className="mapUI locate"
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              panTo({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              getStopsByCoords(
                position.coords.latitude,
                position.coords.longitude,
                true
              );
            },
            () => null,
            {
              enableHighAccuracy: true,
            }
          );
        }}
      >
        <i
          className="fa fa-compass"
          id="innerLocate"
          aria-hidden="true"
          style={{ fontSize: "35px" }}
        />
      </div>
    </Tooltip>
  );
}

function ShowMap({
  source,
  destination,
  stops,
  setRealTime,
  otherRoute,
  directions,
  busIndex,
  getStopsByCoords,
  favStops,
  setFavStops,
}) {
  const [selected, setSelected] = React.useState(null);
  const [address, setAddress] = React.useState(null);
  const [touristModeBool, setTouristModeBool] = React.useState(false);
  const [otherRouteBool, setOherRouteBool] = React.useState(false);
  const [visible, setVisible] = useState(false);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  function iconStatusData() {
    // adding/deleting stop to/from cookies
    if (favStops.stopsids.includes(parseInt(selected.stopid))) {
      delCookie(selected.stopid);
      setFavStops({
        fullname: removeItemOnce(favStops.fullname, selected.fullname),
        stopsids: removeItemOnce(favStops.stopsids, selected.stopid),
      });
    } else {
      setCookie(selected.stopid, selected.fullname);
      favStops.fullname.push(selected.fullname);
      favStops.stopsids.push(parseInt(selected.stopid, 10));
      setFavStops({
        fullname: favStops.fullname,
        stopsids: favStops.stopsids,
      });
    }
  }
  const saveAddOnMap = (Val) => {
    // save address via map
    // Only allows setting of home or work, no unsetting. This is done by overriding values
    let tempAdd = { ...address };
    if (Val === "Work" && !tempAdd.work) {
      tempAdd.work = !tempAdd.work;
    } else if (Val === "Home" && !tempAdd.home) {
      tempAdd.home = !tempAdd.home;
    }
    setAddress(tempAdd);
    saveAddress(Val, address.val);
    saveAddress(Val + "Lat", address.lat);
    saveAddress(Val + "Lng", address.lng);
  };

  const onMapClick = React.useCallback((e) => {
    setAddress(null);
    setSelected(null);
  }, []);

  const onClickHW = () => {
    //Updates address to not just contain source but also booleans for use in state of icons
    let newSource = { ...source };
    newSource["work"] = getAddressByVal("Work") === source.val;
    newSource["home"] = getAddressByVal("Home") === source.val;
    setAddress(newSource);
    setSelected(null);
  };

  // Setting bounds for map to zoom and pan to include all markers, special case if only one marker to avoid over zooming
  let bounds = new window.google.maps.LatLngBounds();

  if (directions.length > 0) {
    for (var i = 0; i < directions.length; i++) {
      for (var j = 0; j < directions[i].length; j++) {
        for (var k = 0; k < directions[i][j].length; k++) {
          var myLatLng = new window.google.maps.LatLng(
            directions[i][j][k].lat,
            directions[i][j][k].lng
          );
          bounds.extend(myLatLng);
        }
      }
    }
  }

  if (stops.length > 0) {
    for (i = 0; i < stops.length; i++) {
      myLatLng = new window.google.maps.LatLng(stops[i].lat, stops[i].lng);
      bounds.extend(myLatLng);
    }
    if (stops.length > 1) {
      mapRef.current.fitBounds(bounds);
    } else {
      mapRef.current.setZoom(16);
    }
    mapRef.current.panTo(bounds.getCenter());
  }

  if (source && destination) {
    var sLatLng = new window.google.maps.LatLng(source.lat, source.lng);
    var dLatLng = new window.google.maps.LatLng(
      destination.lat,
      destination.lng
    );
    bounds.extend(sLatLng);
    bounds.extend(dLatLng);

    mapRef.current.fitBounds(bounds);
    mapRef.current.panTo(bounds.getCenter());
  }

  return (
    <div>
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={centre}
        options={{
          styles: touristModeBool ? mapStylesIcons : mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
        }}
        onLoad={onMapLoad}
        onClick={onMapClick}
      >
        <Locate panTo={panTo} getStopsByCoords={getStopsByCoords} />
        <Tooltip className="tooltip" title="Tourist mode">
          <div className="switch1 mapUI">
            <Switch
              width={35}
              height={22}
              onChange={() => setTouristModeBool(!touristModeBool)}
              checked={touristModeBool}
              className="Switch"
            />
          </div>
        </Tooltip>

        {otherRoute.length > 1 && (
          <div className="switch2 mapUI">
            <Replay
              className="Switch"
              onClick={() => setOherRouteBool(!otherRouteBool)}
            ></Replay>
          </div>
        )}
        {source && otherRoute.length < 1 && stops.length > 1 && (
          // only appears if location is entered not for stops or route
          <Marker
            position={{ lat: source.lat, lng: source.lng }}
            onClick={onClickHW}
          />
        )}

        {/* Loop through either array and add markers, based on switch that appears when another route is provided */}
        {(otherRouteBool ? otherRoute : stops).map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setAddress(null);
              setSelected(marker);
            }}
            icon={{
              url: `./bus_1.svg`,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        ))}

        {address ? (
          <InfoWindow
            position={{ lat: address.lat, lng: address.lng }}
            onCloseClick={() => {
              setAddress(null);
            }}
          >
            <div>
              <h4>
                <p>{address.val}</p>
              </h4>
              <Tooltip className="tooltip" title="Show Weather">
                <Button style={{ margin: 10 }} onClick={() => setVisible(true)}>
                  <Cloud />
                </Button>
              </Tooltip>
              <Modal
                title="Today's Weather"
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
              >
                <ReactWeather
                  forecast="today"
                  apikey="7ad07aac9b0943040a4abdd2c23dfc4e"
                  type="geo"
                  lat={address.lat.toString()}
                  lon={address.lng.toString()}
                />
              </Modal>
              <Tooltip className="tooltip" title="Set Home">
                <Button
                  style={{ margin: 10 }}
                  onClick={() => saveAddOnMap("Home")}
                >
                  {address.home ? <Home /> : <HomeOutlined />}
                </Button>
              </Tooltip>
              <Tooltip className="tooltip" title="Set Work">
                <Button
                  style={{ margin: 10 }}
                  onClick={() => saveAddOnMap("Work")}
                >
                  {address.work ? <Work /> : <WorkOutlined />}
                </Button>
              </Tooltip>
            </div>
          </InfoWindow>
        ) : null}

        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>{selected.fullname}</h2>
              <h4>{`Stop ${selected.stopid}`}</h4>
              {/* <DirectionsBusIcon style={{ color: "blue" }} /> */}
              {Object.keys(selected.lines).map((route, idx) => (
                <span>
                  <DirectionsBusIcon style={{ color: "blue" }} />
                  <strong>{route}</strong>
                  {idx > 0 && idx % 5 === 0 && <br />}
                </span>
              ))}
              <br />
              <Tooltip className="tooltip" title="Real Time">
                <Button
                  style={{ margin: 5 }}
                  onClick={() =>
                    setRealTime(selected.stopid, selected.fullname)
                  }
                >
                  <Watch />
                </Button>
              </Tooltip>
              <Tooltip className="tooltip" title="Show Weather">
                <Button style={{ margin: 5 }} onClick={() => setVisible(true)}>
                  <Cloud />
                </Button>
              </Tooltip>
              <Modal
                title="Today's Weather"
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
              >
                <ReactWeather
                  forecast="today"
                  apikey="7ad07aac9b0943040a4abdd2c23dfc4e"
                  type="geo"
                  lat={selected.lat.toString()}
                  lon={selected.lng.toString()}
                />
              </Modal>
              <Tooltip className="tooltip" title="Toggle Favourite">
                <Button style={{ margin: 5 }} onClick={iconStatusData}>
                  {favStops.stopsids.includes(parseInt(selected.stopid)) ? (
                    <StarIcon />
                  ) : (
                    <StarBorderOutlinedIcon />
                  )}
                </Button>
              </Tooltip>
            </div>
          </InfoWindow>
        ) : null}
        {/* If directions array is populated that loop through the array of arrays and draw polylines, if that current array corresponds to a bus array, then place a stop marker
        at the first waypoint. */}
        {/* Shows stops for luas routes aswell must fix */}
        {directions.map((marker, index) =>
          marker.map((mrk, kindex) => (
            <div key={kindex + "_" + index}>
              {busIndex.includes(index) &&
                [1, mrk.length - 1].map((idx) => (
                  <Marker
                    key={mrk[idx].lat - mrk[idx].lng}
                    position={{ lat: mrk[idx].lat, lng: mrk[idx].lng }}
                    icon={{
                      url: `./bus_1.svg`,
                      origin: new window.google.maps.Point(0, 0),
                      anchor: new window.google.maps.Point(15, 15),
                      scaledSize: new window.google.maps.Size(30, 30),
                    }}
                  />
                ))}
              <Polyline
                path={mrk}
                geodesic={true}
                options={{
                  strokeColor: busIndex.includes(index) ? "#fea100" : "#1b55db",
                  strokeOpacity: 1,
                  strokeWeight: 4,
                }}
              />
            </div>
          ))
        )}
      </GoogleMap>
    </div>
  );
}

export default ShowMap;
