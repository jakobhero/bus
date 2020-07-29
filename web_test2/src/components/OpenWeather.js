import React, {useState} from 'react';
const api = {
  key: "923cacccb6c3bc53838fb85e48716356",
  base: "https://api.openweathermap.org/data/2.5/"
}

function GetWeather() {

  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState({});
  const search = evt => {

    if (evt.key === "Enter") {
      fetch(`${api.base}weather?q=${query}&units=metrics&APPID=${api.key}`)
      .then(res => res.json())
      .then(result => {
        setQuery('');
        setWeather(result);
        console.log(result);
      });
    }
  }

  const dateBuilder = (x) => {

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[x.getDay()];
    let date = x.getDate();
    let month = months[x.getMonth()];
    let year = x.getFullYear();

    return `${day} ${date} ${month} ${year}`
  }

  return (

    <div className={(typeof weather.main != "undefined") ? ((((weather.main.temp - 273) * (9/5) + 32) > 80) ? 'app hot' :
    (((weather.main.temp - 273) * (9/5) + 32) < 40) ? 'app cold' :
    'app') : 'app'}>

      <main>
        <div className="search-box">
          <input
            type="type"
            className="search-bar"
            placeholder="Search..."
            onChange={e => setQuery(e.target.value)}
            value={query}
            onKeyPress={search}
          />
        </div>

        {(typeof weather.main != "undefined") ? (
          <div className="location-box">
            <div className="location">{weather.name}, {weather.sys.country}</div>
            <div className="date">{dateBuilder(new Date())}</div>

            <div className="weather-box">
              <div className="temp">
                {(Math.round((weather.main.temp - 273) * (9/5) + 32))}°F
              </div>
              <div className="weather">{weather.weather[0].main}</div>
              </div>
            </div>
        ) : ('') }
      </main>
    </div>
  );
}

export default GetWeather;