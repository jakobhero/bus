const decode = (encoded) => {
  var points = [];
  var index = 0,
    len = encoded.length;
  var lat = 0,
    lng = 0;
  while (index < len) {
    var b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63; //finds ascii
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
};

export const findPoly = (route) => {
  let full_route = [];
  route.steps.forEach((step, index) => {
    full_route[index] = [];
    step.polyline.forEach((line, idx) => {
      full_route[index][idx] = decode(line);
    });
  });
  return full_route;
};
