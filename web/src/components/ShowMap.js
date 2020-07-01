import React from "react";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import mapStyles from "./mapStyles";

const center = {
  lat: 53.35014,
  lng: -6.266155,
};

const mapContainerStyle = {
  height: "50vh",
  width: "100vw",
};

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};

const libraries = ["geometry", "drawing", "places"];

// class ShowMap extends React.Component {
//   render() {
//     const MapWithAMarker = withScriptjs(
//       withGoogleMap((props) => (
//         <GoogleMap
//           defaultZoom={14}
//           defaultCenter={{ lat: 53.35014, lng: -6.266155 }}
//         >
//           <Marker position={{ lat: 53.35014, lng: -6.266155 }} />
//         </GoogleMap>
//       ))
//     );

//     return (
//       <MapWithAMarker
//         googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBIat_qIkzYE3is-s7gc9BQtNJdd3hQ-0g&v=3.exp&libraries=geometry,drawing,places"
//         loadingElement={<div style={{ height: `100%` }} />}
//         containerElement={<div style={{ height: `400px` }} />}
//         mapElement={<div style={{ height: `100%` }} />}
//       />
//     );
//   }
// }

// export default ShowMap;

export default function ShowMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBIat_qIkzYE3is-s7gc9BQtNJdd3hQ-0g",
    libraries,
  });
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

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div>
      <Locate panTo={panTo} />
      {/* <Search panTo={panTo} /> */}
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      ></GoogleMap>
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
      <img src="/compass.svg" alt="compass" />
    </button>
  );
}

// function Search({ panTo }) {
//   const {
//     ready,
//     value,
//     suggestions: { status, data },
//     setValue,
//     clearSuggestions,
//   } = usePlacesAutocomplete({
//     requestOptions: {
//       location: { lat: () => 43.6532, lng: () => -79.3832 },
//       radius: 100 * 1000,
//     },
//   });

//   // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest

//   const handleInput = (e) => {
//     setValue(e.target.value);
//   };

//   const handleSelect = async (address) => {
//     setValue(address, false);
//     clearSuggestions();

//     try {
//       const results = await getGeocode({ address });
//       const { lat, lng } = await getLatLng(results[0]);
//       panTo({ lat, lng });
//     } catch (error) {
//       console.log("😱 Error: ", error);
//     }
//   };

//   return (
//     <div className="search">
//       <Combobox onSelect={handleSelect}>
//         <ComboboxInput
//           value={value}
//           onChange={handleInput}
//           disabled={!ready}
//           placeholder="Search your location"
//         />
//         <ComboboxPopover>
//           <ComboboxList>
//             {status === "OK" &&
//               data.map(({ id, description }) => (
//                 <ComboboxOption key={id} value={description} />
//               ))}
//           </ComboboxList>
//         </ComboboxPopover>
//       </Combobox>
//     </div>
//   );
// }
