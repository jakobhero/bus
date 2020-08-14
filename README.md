## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
- [Features](#features)
- [Demo](#demo)

## General info

This project involves analysing historic Dublin Bus data and weather data in order to create dynamic travel time estimates. Based on data analysis of historic Dublin Bus data, a system which when presented with any bus route, departure time, the day of the week, current weather condition, produces an accurate estimate of travel time for the complete route and sections of the route.

This project also involves providing an easy to use and powerful interface for users to request travel time estimates using buses based on the models provided by our backend. Along with travel time estimates; complementary features such as Real Time Information, Favourites etc are provided.

## Technologies

Project is created with:

- Frontend
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

## Deployment

The webapp is currently deployed at https://ipa-003.ucd.ie/.
The webserver uses is Nginx, which is used is conjunction with gunicorn to run the backend server.

##### Note:

Https is a requirement for user location functionality and caching is enabled for 1 year.

## Demo

<img src="./web/Demo/demo.gif" alt="Demo Gif"
	title="Demo"/>
