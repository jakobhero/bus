import React from "react";

import {
  GoogleMap,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import mapStyles from "./mapStyles";
import mapStylesIcons from "./mapStylesIcons";

import Switch from "react-switch";

import { Button } from "antd";
import { HistoryOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import Tooltip from "@material-ui/core/Tooltip";

import "../css/map.css";
// https://www.youtube.com/watch?v=SySVBV_jcCM

const mapContainerStyle = {
  height: "70vh",
};

function ShowMap({
  source,
  destination,
  stops,
  centreON,
  setRealTime,
  otherRoute,
  directions,
  busIndex,
}) {
  const [selected, setSelected] = React.useState(null);
  const [touristModeBool, setTouristModeBool] = React.useState(false);
  const [otherRouteBool, setOherRouteBool] = React.useState(false);
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  // return full_route;
  // }
  // let bounds = new window.google.maps.LatLngBounds();
  // for (var i = 0; i < markers.length; i++) {
  //   bounds.extend({ lat: markers[i].lat, lng: markers[i].lng });
  // }
  // mapRef.current.fitBounds(bounds);

  // Centre and zoom will need to be done properly in sprint 3

  return (
    <div>
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={centreON}
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
          <div className="switch2 mapUI">
            <Switch
              width={35}
              height={22}
              onChange={() => setOherRouteBool(!otherRouteBool)}
              checked={otherRouteBool}
              className="Switch"
            />
          </div>
        )}
        {source && <Marker position={{ lat: source.lat, lng: source.lng }} />}
        {/* Loop through either array and add markers, based on switch that appears when another route is provided */}
        {(otherRouteBool ? otherRoute : stops).map((marker) => (
          <Marker
            key={marker.lat - marker.lng}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => setSelected(marker)}
            icon={{
              url: `./bus.svg`,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        ))}
        {destination && (
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
              // console.log(mrk)
              <div key={(mrk[0].lat - mrk[0].lng) * (index + 1)}>
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
