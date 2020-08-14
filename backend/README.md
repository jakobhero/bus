# Backend
The Backend of the Dublin Bus App is built in Flask and serves as an API to provide data pertinent to the stops, routes, real-time information and direction information of Dublin Bus rides.
## Prerequisites
Before you can start with the installation of the Dublin Bus Backend, the following requirements must be met:
* You have installed the latest version of Python
* You have installed the latest version of PostgreSQL
## Installing The Dublin Bus Backend
* Clone this repository
* Move into the backend folder with `cd .../bus/backend`
* Create a virtual environment with `python -m venv venv`
* Activate virtual environment with `venv\Scripts\activate.bat` on Windows, `venv/Scripts/activate` on Mac / Linux, `venv\Scripts\activate.ps1` on PowerShell
* Install requirements with `pip install -r requirements.txt`
* Insert your Google cloud console and Open Weather Map API keys into `api/config.py` with:
```
GOOGLE_KEY=your_key
OWM_KEY=your_key
```
* Enable the Google Directions API for you key
* Create the PostgreSQL database with the specifications provided in db/database.ini
* Move into the database folder with `cd db`
* Make sure you have the following datasets stored in backend/db/data:
	* `rt_leavetimes_DB_2018.txt` and `rt_trips_DB_2018.txt` from Dublin Bus. **Note that these two datasets are only authorized for confidential use to members of this project and shall not leave the UCD server.**
	* `2018_historic_weather.csv` from the [Open Weather Map API](https://home.openweathermap.org/history_bulks/new) (a bulk for the metric weather data for Dublin, Ireland from 1 Jan 2018 to 31 Dec 2018 costs $10 as of 7 Aug 2020)
	* The latest GTFS data from [Transitfeeds](http://transitfeeds.com/p/transport-for-ireland/782/latest/download). Make sure the datasets `trips.txt`, `routes.txt`, `stops.txt` and `stop_times.txt` exist in the path `gtfs/raw`
* Populate the database with the data used for Modelling with these commands (note that the leavetimes and trips data is confidential data authorized to be used on the UCD server of the contributors only and thus cannot be shared with the general public):
```
python clean_leavetimes.py
python clean_trips.py
python clean_weather.py
python create.py
python populate.py
```
* Populate the database with the data used for Static Timetables with these commands:
```
python gtfs_clean.py
python gtfs_create.py
python gtfs_populate.py
```
* Move back into the backend root with `cd ..`
* Run `python app.py` to start up the backend
## Using the Dublin Bus Backend
The Backend's base URL is `http://127.0.0.1:5000/`. It offers the following API endpoints:
* `api/stops` returns all stops of Dublin Bus that contain the required parameter `substring` in their name or stop ID
* `api/nearestneighbor` returns a list of the `k` closest bus stops in terms of aerial distance from the specified parameters `lat` and `lon`. If `k` is not specified, the 20 closest stops are returned.
* `api/realtime` returns a list of real-time soon-to-arrive buses for a specified `stopid`
* `api/routeinfo` returns a list of all stops on a specified `routeid`, including stop details for both directions
* `api/directions` returns a JSON object that contains directions for a set of connections from specified `dep` to `arr`. The locations can be provided as either Strings of their names or set of coordinates in the format `lat,lon`. A time in the future can be specified in the optional parameter `time`. If no time is specified, now is assumed as default.