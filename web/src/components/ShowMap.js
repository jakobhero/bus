import React from "react";

import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import mapStyles from "./mapStyles";
import mapStylesIcons from "./mapStylesIcons";

// import { DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import Switch from "react-switch";
// const center = {
//   lat: 53.35014,
//   lng: -6.266155,
// };

// https://www.youtube.com/watch?v=SySVBV_jcCM

const mapContainerStyle = {
  height: "70vh",
  width: "100vw",
};

// const libraries = ["geometry", "drawing", "places"];

function ShowMap({ source, destination, stops, centreON }) {
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const [mapSettings, setMapSettings] = React.useState({
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
  });
  const [touristModeBool, setTouristModeBool] = React.useState(false);

  const touristMode = () => {
    setMapSettings({
      styles: touristModeBool ? mapStyles : mapStylesIcons,
      disableDefaultUI: true,
      zoomControl: true,
    });
    setTouristModeBool(!touristModeBool);
  };

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

  // const [response, setResponse] = React.useState(null);
  // const directionsCallback = (response) => {
  //   console.log(response);

  //   if (response !== null) {
  //     if (response.status === "OK") {
  //       setResponse(() => ({
  //         response,
  //       }));
  //     } else {
  //       console.log("response: ", response);
  //     }
  //   }
  // };

  // let bounds = new window.google.maps.LatLngBounds();
  // for (var i = 0; i < markers.length; i++) {
  //   bounds.extend({ lat: markers[i].lat, lng: markers[i].lng });
  // }
  // mapRef.current.fitBounds(bounds);

  // Centre and zoom will need to be done properly in sprint 3

  return (
    <div>
      <Locate panTo={panTo} />
      <Switch onChange={touristMode} checked={touristModeBool} />
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={centreON}
        options={mapSettings}
        onClick={onMapClick}
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
            key={marker.stop_lat - marker.stop_lon}
            position={{ lat: marker.stop_lat, lng: marker.stop_lon }}
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
            position={{ lat: selected.stop_lat, lng: selected.stop_lon }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>
                <p>{`Stop ${selected.id}`}</p>
              </h2>
            </div>
          </InfoWindow>
        ) : null}

        {/* {destination !== "" && source !== "" && (
          <DirectionsService
            // required
            options={{
              destination: destination,
              origin: source,
              travelMode: "DRIVING",
            }}
            // required
            callback={directionsCallback}
          />
        )} */}

        {/* {response !== null && (
          <DirectionsRenderer
            // required
            options={{
              directions: response,
            }}
          />
        )} */}
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
