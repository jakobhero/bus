# Frontend

## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
- [Features](#features)
- [Demo](#demo)

## General info

This project involves providing an easy to use and powerful interface for users to request travel time estimates using Dublin bus based on the models provided by our backend. Along with travel time estimates, complementary features such as Real Time Information and Favourites are provided.

## Technologies

Project is created with:

- React Hooks
- Use-Places-Autocomplete
- React-google-maps/api
- Ant Design
- Material - UI

## Setup

To run this project, install it locally using npm:

1. Fork or Clone this repository 'git clone https://github.com/jakobhero/bus.git'
1. Install Node 12.16.2
1. Enter the `web` directory and run `npm install`.
1. Start the client app by running `npm start`, and wait for the app to start up. (`Starting the development server...` is not the final line).
1. Finally, navigate to [localhost:3000](http://localhost:3000) in your browser - you should see a styled page.

### Features

##### Smart Search

- This search box returns results from stops search, route search and the google places search along with the users current location.

##### Source and destination swap

- Press the swap icon in the destination search box, this will swap the two values.

##### User Location

- Select Current Location in the dropdown menu, it will populate the search bar with the formatted address of your current location as given by google.

##### Find Nearby Stops

- When given an input of latitude and longitude, returns the 20 nearest stops, input can either be from search for a single place with the search bar or by pressing the user location button on the map.

##### Google Map

- A map to display markers indicating location or stops, markers for stops containing the stop name, stop id and the routes serviced by the stop. There are also buttons to bring the user to the real time information for that stop, weather information for that location or the ability to set the stop as a favourite. Location markers are similar with buttons for weather and setting as Home/Work.

##### Local Weather

- Clicking on any map marker will bring up an info window, here you can press a button to reveal a modal with the local weather.

##### Stops by Route

- When a user searches for a route in the smart search the stops on the route are returned and displayed on the map. The user can click the change direction icon on the map to switch to showing the other stops.

##### Directions on map

- When a user searches for directions the first route will be displayed on the map with the blue polyline indicating the walking portion and the yellow polyline indicating the bus portion of the journey.
  Clicking on the other options in the connections tab will update the directions on the map. The map will automatically zoom and pan to fit all points.

##### Favourites

- This feature works by storing cookies in the users browser, clicking on the toggle favourite icon will either add or remove a cookie. All favourites are displayed in the favourites tab, where you can quickly access real time information for a stop or populate the search bar with your home or work address.

##### Real Time

- On this tab, given a stop id; it will display all the buses due at that stop based on the real time information. If no stop is provided then an empty table is displayed.

##### Set Alarm

- Within the table is a set alarm column with a button to open a modal that gives the user the option to be notified when the selected bus is due in 1, 5 or 10 mins. If the bus is already due in less than any of these values then that value is disabled.

## Demo

<img src="./Demo/demo.gif" alt="Demo Gif"
	title="Demo"/>
