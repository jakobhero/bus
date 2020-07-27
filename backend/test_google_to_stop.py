import json
import os
import requests
import datetime
import numpy as np
from pprint import pprint
import time
import random


def get_connections(origin, destination):
    print("Getting connection")
    params = {
        "origin": origin,
        "destination": destination,
        "key": os.environ.get('GOOGLE_KEY'),
        "mode": "transit",
        "departure_time": "now",
        "alternatives": "true"
    }

    # make request-
    url = "https://maps.googleapis.com/maps/api/directions/json?"
    req = requests.get(url, params=params)
    res = req.json()

    # the response will be an array of routes
    connections = []

    # the available alternatives for getting from A to B are stored in the routes array
    for route in res["routes"]:
        # as there are not waypoints specified, there is always going to be exactly one leg in the response:
        route = route["legs"][0]

        # route specific information is stored in variable curr
        curr = {
            "distance": route["distance"]["value"],
            "duration": route["duration"]["value"]
        }

        db_index = []  # holds index of dublin bus travel(s) in leg array
        transit_index = []  # holds index of all transit travel(s) in leg array
        steps = []
        index = 0

        # the required steps to get from A to B in each alternative are stored in the legs array
        for step in route["steps"]:

            # step specific information is stored in variable curr_step.
            # the information pertinent to all steps will be accessible from the routes in the steps array.
            curr_step = {
                "distance": step["distance"]["value"],
                "duration": step["duration"]["value"],
                "start": step["start_location"],
                "stop": step["end_location"],
                "mode": step["travel_mode"]
            }

            # transic specific information is stored in variable transit, which will be addedd to curr_step
            if curr_step["mode"] == "TRANSIT":
                transit = {
                    "dep": {
                        "name": step["transit_details"]["departure_stop"]["name"],
                        "time": step["transit_details"]["departure_time"]["value"]
                    },
                    "arr": {
                        "name": step["transit_details"]["arrival_stop"]["name"],
                        "time": step["transit_details"]["arrival_time"]["value"]
                    },
                    "headsign": step["transit_details"]["headsign"],
                    "type": step["transit_details"]["line"]["vehicle"]["type"],
                    "operator": step["transit_details"]["line"]["agencies"][0]["name"]
                }

                if transit["operator"] in ["Dublin Bus", "Go-Ahead"]:
                    if transit["operator"] == "Dublin Bus":
                        db_index.append(index)
                    transit["route"] = step["transit_details"]["line"]["short_name"]
                if transit["operator"] == "Luas":
                    transit["route"] = step["transit_details"]["line"]["name"]
                transit_index.append(index)
                curr_step["transit"] = transit

            steps.append(curr_step)
            index += 1

        curr["db_index"] = db_index
        curr["steps"] = steps

        connections.append(curr)
    return connections


def find_nearest_stop(coords, k):
    url = "http://localhost/nearestneighbor?lat=" + \
        str(coords['lat']) + "&lng=" + str(coords['lng']) + "&k=" + str(k)
    req = requests.get(url)
    return req.json()


def get_stops(stopsObj):
    """Iterates through object and extracts stopid for place in dictionary"""
    stops = {}
    for stop in stopsObj:
        stops[stop['stopid']] = "dummy"
    return stops


def find_stops_by_route(route):
    url = "http://localhost/routeinfo?routeid=" + str(route)
    req = requests.get(url)
    first = get_stops(req.json()[0])
    second = get_stops(req.json()[1])
    return first, second


def find_stops(data):
    if not 'stop' in data['transit']['arr']['name']:
        print("Finding arr from Co ords")
        stop_arr = find_nearest_stop(data['stop'], 1)[
            'stops'][0]['stopid']
    else:
        temp = data['transit']['arr']['name'].split()
        stop_index = temp.index('stop') + 1
        stop_arr = temp[stop_index]

    if not 'stop' in data['transit']['dep']['name']:
        print("Finding dep from Co ords")
        stop_dep = find_nearest_stop(data['start'], 1)[
            'stops'][0]['stopid']

    else:
        temp = data['transit']['dep']['name'].split()
        stop_index = temp.index('stop') + 1
        stop_dep = temp[stop_index]
    return stop_arr, stop_dep


def find_new_stop(coords, route1, route2, otherstop):
    stops = find_nearest_stop(coords, 20)['stops']
    for stop in stops:
        temp_stop = stop['stopid']
        if (temp_stop in route1 and otherstop in route1) or (temp_stop in route2 and otherstop in route2):
            return temp_stop


def test_stops(connections):
    for connection in connections:
        for index in connection['db_index']:
            print("="*25)
            data = connection['steps'][index]
            route = data['transit']['route']

            stop_arr, stop_dep = find_stops(data)
            print("Arrival stop: ", stop_arr)
            print("Departure stop: ", stop_dep)
            print("Bus route: ", route)

            route1, route2 = find_stops_by_route(route)
            if (stop_arr in route1 and stop_dep in route1) or (stop_arr in route2 and stop_dep in route2):
                print("Both stops are in the same route")
            else:
                print(
                    "Stops are not on the same route, mission failed. Calculating new stops....")
                if (stop_arr in route1 or stop_arr in route2):
                    print("arr stop is correct")
                    # if arrival stop is correct
                    new_stop_dep = find_new_stop(
                        data['start'], route1, route2, stop_arr)
                    if new_stop_dep:
                        stop_dep = new_stop_dep
                    else:
                        print("no stops found")
# Still no stops found in some instances, increasing k will prob not have much affect

                elif (stop_dep in route1 or stop_dep in route2):
                    # if departure stop is correct
                    print("dep stop is correct")
                    new_stop_arr = find_new_stop(
                        data['stop'], route1, route2, stop_dep)
                    if new_stop_arr:
                        stop_arr = new_stop_arr
                    else:
                        print("no stops found")
                else:
                    print("Neither stop is correct")
                    # TCD to Smithfield on 66
                    stops = find_nearest_stop(data['start'], 5)['stops']
                    for stop in stops:
                        stop_dep = stop['stopid']
                        if (stop_dep in route1) or (stop_dep in route2):
                            break
                    else:
                        print("no stop found")
                    stops = find_nearest_stop(data['stop'], 5)['stops']
                    for stop in stops:
                        stop_arr = stop['stopid']
                        if (stop_dep in route1 and stop_arr in route1) or (stop_dep in route2 and stop_arr in route2):
                            break
                    else:
                        print("no stop found")
                print("New stops:")
                print("Arrival stop: ", stop_arr)
                print("Departure stop: ", stop_dep)


addresses = ['Trinity College, College Green, Dublin 2', 'Belvedere College SJ, Great Denmark Street, Northside, Dublin 1',
             'Smithfield, Dublin', 'Ringsend, County Dublin', 'Dundrum, Dublin', 'Howth, Dublin', 'Dún Laoghaire, Dublin', 'Crumlin, Dublin', 'Ballinteer, County Dublin']

for _ in range(len(addresses)):
    source, destination = random.sample(addresses, 2)
    print("Source: ", source)
    print("Destination: ", destination)
    connections = get_connections(source, destination)
    test_stops(connections)
    time.sleep(1)

# connections = get_connections(
#     'Trinity College, College Green, Dublin 2', 'Smithfield, Dublin')
# test_stops(connections)

# print(find_stops_by_route('66b')[1]['1445'])
