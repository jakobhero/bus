import axios from "axios";
function setCookie(name, value) {
  var days = 1;
  var exp = new Date();
  // cookies will last for a day
  exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);

  axios
    .get("http://localhost/api/stops?substring=" + name)
    .then((res) => {
      if (res.statusText === "OK") {
        console.log(res.data.stops[0]);
        return res.data.stops[0].fullname;
      }
    })
    .then((fullname) => {
      document.cookie = `${name}=${fullname};expires=${exp.toGMTString()}`;
    });
}

function saveAddress(name, value) {
  var days = 1;
  var exp = new Date();
  // cookies will last for a day
  exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${exp.toGMTString()}`;
}

function getStopNames() {
  var favStops = "";
  var storedCookies = document.cookie.split(";");
  for (let i = 0; i < storedCookies.length; i++) {
    var stopInfo = storedCookies[i].split("=");
    if (!isNaN(stopInfo[0])) {
      favStops += stopInfo[1];
      favStops += "; ";
    }
  }
  return favStops;
}

function getStopNums() {
  var storedCookies = document.cookie.split(";");
  var stopNums = new Array();
  for (let i = 0; i < storedCookies.length; i++) {
    var stopInfo = storedCookies[i].split("=");
    if (!isNaN(stopInfo[0])) {
      stopNums[i] = parseInt(stopInfo[0]);
    }
  }
  return stopNums;
}

function getAddressByVal(Val) {
  var storedCookies = document.cookie.split(";");
  for (let i = 0; i < storedCookies.length; i++) {
    var stopInfo = storedCookies[i].split("=");
    if (stopInfo[0].trim() === Val) {
      var Addree = stopInfo[1];
    }
  }
  return Addree;
}

function getIdByName(name) {
  var storedCookies = document.cookie.split(";");
  for (let i = 0; i < storedCookies.length; i++) {
    var stopInfo = storedCookies[i].split("=");
    if (stopInfo[1] === name) {
      var stopNum = stopInfo[0];
    }
  }
  return stopNum;
}

function delCookie(name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  document.cookie = `${name}=delete;expires=${exp.toGMTString()}`;
}

export {
  setCookie,
  saveAddress,
  getAddressByVal,
  getStopNums,
  getStopNames,
  getIdByName,
  delCookie,
};
