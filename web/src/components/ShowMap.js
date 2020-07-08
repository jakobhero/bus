import React from "react";

import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import mapStyles from "./mapStyles";
import mapStylesIcons from "./mapStylesIcons";

import Switch from "react-switch";

import { Button } from "antd";
// https://www.youtube.com/watch?v=SySVBV_jcCM

const mapContainerStyle = {
  height: "70vh",
  width: "100vw",
};

function ShowMap({ source, destination, stops, centreON, setRealTime }) {
  const [selected, setSelected] = React.useState(null);
  const [touristModeBool, setTouristModeBool] = React.useState(false);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);
  // let bounds = new window.google.maps.LatLngBounds();
  // for (var i = 0; i < markers.length; i++) {
  //   bounds.extend({ lat: markers[i].lat, lng: markers[i].lng });
  // }
  // mapRef.current.fitBounds(bounds);

  // Centre and zoom will need to be done properly in sprint 3

  return (
    <div>
      <Locate panTo={panTo} />
      <Switch
        onChange={() => setTouristModeBool(!touristModeBool)}
        checked={touristModeBool}
      />
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
        {source && (
          <Marker
            position={{ lat: source.lat, lng: source.lng }}
            // onClick={() => setSelected(marker)}
          />
        )}
        {stops.map((marker) => (
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
          <Marker
            // key={source.lat - marker.lng}
            position={{ lat: destination.lat, lng: destination.lng }}

            // onClick={() => setSelected(marker)}
          />
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
                <Button
                  style={{ margin: 20 }}
                  onClick={() =>
                    setRealTime(selected.stopid, selected.lat, selected.lng)
                  }
                >
                  Due Times
                </Button>
              </h2>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  return (
    <i
      className="fa fa-compass"
      aria-hidden="true"
      style={{ fontSize: "30px" }}
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
    ></i>
  );
}

export default ShowMap;
