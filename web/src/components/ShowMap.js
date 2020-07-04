import React from "react";

import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import mapStyles from "./mapStyles";

// const center = {
//   lat: 53.35014,
//   lng: -6.266155,
// };

const mapContainerStyle = {
  height: "70vh",
  width: "100vw",
};

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};

// const libraries = ["geometry", "drawing", "places"];

function ShowMap({ source, destination, stops, centreON }) {
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const onMapClick = React.useCallback((e) => {
    setMarkers((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        time: new Date(),
      },
    ]);
  }, []);

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
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={centreON}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {source && (
          <Marker
            // key={source.lat - marker.lng}
            position={{ lat: source.lat, lng: source.lng }}
            // onClick={() => setSelected(marker)}
          />
        )}
        {markers.map((marker) => (
          <Marker
            key={marker.lat - marker.lng}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => setSelected(marker)}
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
                <p>Clicked</p>
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
    <button
      className="locate"
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
      <i className="fa fa-compass" aria-hidden="true"></i>
    </button>
  );
}

export default ShowMap;
