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
import Replay from "@material-ui/icons/Replay";
import { Button, Modal } from "antd";
import { HistoryOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import Tooltip from "@material-ui/core/Tooltip";
import WeatherIcon from "react-icons-weather";
import ReactWeather from "react-open-weather";
//Optional include of the default css styles
import "react-open-weather/lib/css/ReactWeather.css";
import axios from "axios";
import "../css/map.css";

// https://www.youtube.com/watch?v=SySVBV_jcCM

const mapContainerStyle = {
  height: "70vh",
};

const centre = {
  lat: 53.35014,
  lng: -6.266155,
};

function ShowMap({
  source,
  destination,
  stops,
  setRealTime,
  otherRoute,
  directions,
  busIndex,
}) {
  const [selected, setSelected] = React.useState(null);
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

  const directionsBusMarker = (lat, lng) => {
    axios
      .get(
        "http://localhost/api/nearestneighbor?lat=" +
          lat +
          "&lng=" +
          lng +
          "&k=1"
      )
      .then((res) => {
        console.log(res);
        if (res.statusText === "OK") {
          setSelected(res.data.stops[0]);
        }
      })
      .catch(console.log);
  };

  let bounds = new window.google.maps.LatLngBounds();

  if (stops.length > 0) {
    for (var i = 0; i < stops.length; i++) {
      var myLatLng = new window.google.maps.LatLng(stops[i].lat, stops[i].lng);
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

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = (e) => {
    setVisible(false);
  };

  const handleCancel = (e) => {
    setVisible(false);
  };
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
      >
        <Locate panTo={panTo} />
        <div className="switch1 mapUI">
          <Tooltip className="tooltip" title="Sort by bus changes">
            <Switch
              width={35}
              height={22}
              onChange={() => setTouristModeBool(!touristModeBool)}
              checked={touristModeBool}
              className="Switch"
            />
          </Tooltip>
        </div>

        {otherRoute.length > 1 && (
          <div
            className="switch2 mapUI"
            onClick={() => setOherRouteBool(!otherRouteBool)}
          >
            <Replay className="Switch"></Replay>
          </div>
        )}
        {source && otherRoute.length < 1 && (
          <Marker position={{ lat: source.lat, lng: source.lng }} />
        )}
        {/* Loop through either array and add markers, based on switch that appears when another route is provided */}
        {(otherRouteBool ? otherRoute : stops).map((marker) => (
          <Marker
            key={marker.lat - marker.lng}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => setSelected(marker)}
            icon={{
              url: `./bus_1.svg`,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        ))}
        {destination && otherRoute.length < 1 && (
          <Marker position={{ lat: destination.lat, lng: destination.lng }} />
        )}
        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>
                <p>{`Stop ${selected.stopid}`}</p>
              </h2>
              <p>{selected.fullname}</p>
              <Button
                style={{ margin: 10 }}
                onClick={() =>
                  setRealTime(selected.stopid, selected.lat, selected.lng)
                }
              >
                <HistoryOutlined />
              </Button>
              <Button style={{ margin: 10 }}>
                <StarOutlined />
              </Button>
              <Button style={{ margin: 10 }} onClick={showModal}>
                <WeatherIcon
                  name="owm"
                  iconId="200"
                  flip="horizontal"
                  rotate="90"
                />
              </Button>
              <Modal
                title="Today's Weather"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
              >
                <ReactWeather
                  forecast="today"
                  apikey="7ad07aac9b0943040a4abdd2c23dfc4e"
                  type="city"
                  city="Dublin"
                />
              </Modal>
              <Button style={{ margin: 10 }}>
                <StarFilled />
              </Button>
            </div>
          </InfoWindow>
        ) : null}
        {/* If directions array is populated that loop through the array of arrays and draw polylines, if thatcurrent array corresponds to a bus array, then place a stop marker
        at the first waypoint. */}
        {directions.length > 1 &&
          directions.map((marker, index) =>
            marker.map((mrk) => (
              <div key={(mrk[0].lat - mrk[0].lng) * (index + 1)}>
                {busIndex.includes(index) &&
                  [1, mrk.length - 1].map((idx) => (
                    <Marker
                      key={mrk[idx].lat - mrk[idx].lng}
                      position={{ lat: mrk[idx].lat, lng: mrk[idx].lng }}
                      onClick={() =>
                        directionsBusMarker(mrk[idx].lat, mrk[idx].lng)
                      }
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
                    strokeColor: busIndex.includes(index)
                      ? "#fea100"
                      : "#1b55db",
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

function Locate({ panTo }) {
  return (
    <div
      className="mapUI locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
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
  );
}

export default ShowMap;
