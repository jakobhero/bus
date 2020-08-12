import json, requests, datetime, numpy as np, pandas as pd, time, pickle, holidays
from sklearn.neighbors import KDTree
from flask_restful import Resource, Api, reqparse
from sqlalchemy.types import String
from statistics import mode, mean

from sqlalchemy import cast
from .models import Stops as StopsModel, StopsRoute as SRModel, GTFS_trips, GTFS_times, GTFS_stops, Weather, db
from .config import Config


api = Api()
stops = None
coords = None
tree = None
stops_dict = None
models = {}
features = None
weather = None
forecast = None
routes = {}
holidays_IE=holidays.Ireland()

class TestWeather(Resource):
    """will replace current behaviour when the prediction is not in the 48 hour forecast window of OWM."""
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('time', type=int) 
        frontend_params = parser.parse_args()
        if frontend_params["time"]==None:
            time=datetime.datetime.now().timestamp()
        else:
            time=frontend_params["time"]
        dt=datetime.datetime.fromtimestamp(time)
        weather_descriptions=[]
        humidities=[]
        for row in Weather.query.filter(Weather.month==dt.month,Weather.hour==dt.hour).all():
            weather_descriptions.append(row.weather_description)
            humidities.append(row.humidity)
        return mode[weather_descriptions],round(mean(humidities))

class Test(Resource):
    def get(self):
        with open('api/debugging2/1596807571.json', 'r') as data:
            directions = json.load(data)

        with open('api/debugging3/1596807571.json', 'r') as data:
            model_info = json.load(data)

        for i in range(len(model_info)):
            for j in range(len(model_info[i])):
                leg = model_info[i][j]
                print(f"Model info for leg ({i,j}):")
                print(leg)
                t_start = find_trip(
                    leg["start"]["time"], leg["start"]["id"], leg["route"], leg["direction"])
                print(f"Start info for leg({i,j}):")
                print(t_start)
                if len(t_start) == 0:
                    print("Error: Couldn't find a bus with the following parameters:")
                    print(leg["start"]["time"], leg["start"]
                          ["id"], leg["route"], leg["direction"])
                    break
                index = 0
                midnight = datetime.datetime.fromtimestamp(leg["start"]["time"]).replace(
                    hour=0, minute=0, second=0, microsecond=0)
                # find the latest bus that doesn't depart prior to our set time
                while(True):
                    curr = t_start[index]
                    prediction = get_prediction(
                        curr["start_time"],int(midnight.timestamp())+curr["start_time"], curr["duration"], curr["route_id"], curr["direction"])
                    # TODO replace the time with what's specified in the request
                    if int(midnight.timestamp())+curr["start_time"]+prediction < leg["start"]["time"]:
                        break
                    index += 1
                    if index == len(t_start):
                        break
                start=t_start[max(0,index-1)]
                start["duration_p"]=prediction
                start["dep_p"]=start["start_time"]+prediction
                
                t_stop=match_trip(start["trip_id"],leg["stop"]["id"])
                print(f"stop info for leg ({i,j}):")
                print(t_stop)
                prediction=get_prediction(start["start_time"],int(midnight.timestamp())+start["start_time"],t_stop["duration"],leg["route"],leg["direction"])
                t_stop["duration_p"]=prediction
                t_stop["dep_p"]=start["start_time"]+prediction
                
                #correct the values of directions
                connection=directions["connections"][i]
                bus_travel=connection["steps"][connection["db_index"][j]]
                bus_travel["duration"]=t_stop["duration_p"]-start["duration_p"]
                bus_travel["transit"]["arr"]["time"]=midnight.timestamp()+t_stop["dep_p"]
                bus_travel["transit"]["dep"]["time"]=midnight.timestamp()+start["dep_p"]
                bus_travel["transit"]["source"]="TFI HOOLIGANS"
                bus_travel["transit"]["arr"]["delta"]=t_stop["dep_p"]-t_stop["dep_time"]
                bus_travel["transit"]["dep"]["delta"]=start["dep_p"]-start["dep_time"]

                
                #modify start time if the current bus ride is the first on the connection
                if j==0:
                    prior_travel=0 #time it takes to get to first bus
                    for k in range(connection["db_index"][j]):
                        prior_travel += connection["steps"][k]["duration"]
                    connection["start"]["time"] = start["dep_p"]-prior_travel

                # check if there are more dublin bus journeys on this connection
                if j < len(model_info[i])-1:
                    # add the delta of predicted arrival and scheduled arrival to the start of the next bus journey
                    p_delta = t_stop["dep_p"]-t_stop["dep_time"]
                    model_info[i][j+1]["start"]["time"] += p_delta
                    model_info[i][j+1]["stop"]["time"] += p_delta
                # if the current is the last journey, modify the final time
                else:
                    later_travel = 0  # time it takes to get from final bus stop to destination
                    for k in range(connection["db_index"][j]+1, len(connection["steps"])):
                        later_travel += connection["steps"][k]["duration"]
                    connection["end"]["time"] = t_stop["dep_p"]+later_travel
                    connection["duration"] = connection["end"]["time"] - \
                        connection["start"]["time"]
        return directions

class Stops(Resource):
    """API Endpoint for Dublin Bus stop information. Returns all stops that contain specified substring in either
    ID or name."""

    def get(self):
        global stops_dict

        if stops_dict == None:
            build_stops_dict()

        parser = reqparse.RequestParser()
        parser.add_argument('substring', type=str)
        frontend_params = parser.parse_args()

        if frontend_params["substring"] == None:
            return {"status": "Error! No substring specified."}

        response = []
        looking_for = frontend_params["substring"]+'%'

        # if the length of substring is shorter than 3, only the beginning of stopid, name is checked.
        if (len(frontend_params["substring"]) > 2):
            # if substring is longer than 2 chars, it is checked whether substring is contained.
            looking_for = '%'+looking_for
        for count, row in enumerate(StopsModel.query.filter(StopsModel.stop_id.ilike(looking_for)).all()[:3]):
            response.append({
                'stop_id': row.stop_id,
                'fullname': row.name,
                'lat': row.lat,
                'lng': row.lon,
                'key': count + row.lat-row.lon,
                'lines': stops_dict[row.stop_id]
            })
        for count, row in enumerate(StopsModel.query.filter(StopsModel.name.ilike(looking_for)).all()[:3]):
            response.append({
                'stop_id': row.stop_id,
                'fullname': row.name,
                'lat': row.lat,
                'lng': row.lon,
                'key': count + row.lat-row.lon,
                'lines': stops_dict[row.stop_id]
            })
        return {"stops": response, "status": "OK"}

class NearestNeighbor(Resource):
    """API endpoint for Dublin Bus stop information. Returns the k nearest bus stops to the coordinates specified in request.
    If k is not specified in request, the a default of 20 closest stops is returned. If coordinates are not specified in request,
    all bus stops are returned. For the calculation of the closest stops, a KD tree is used to find results in O(log(n))."""

    def get(self):
        global stops
        global tree

        # parse arguments "lat", "lon", "k" in request
        parser = reqparse.RequestParser()
        parser.add_argument('lat', type=str)
        parser.add_argument('lng', type=str)
        parser.add_argument('k', type=int)
        frontend_params = parser.parse_args()

        if stops == None:
            build_tree()

        # check for required params
        if frontend_params["lat"] == None or frontend_params["lng"] == None:
            return {"stops": stops, "status": "OK"}

        k = 20  # set default value for nearest neighbors to be returned

        if frontend_params["k"] != None:
            k = frontend_params["k"]

        # set coordinates for nearest neighbor search
        try:
            target = [[float(frontend_params["lat"]),
                       float(frontend_params["lng"])]]
        except:
            return {"status": "Error: Coordinates could not be parsed to float"}

        response = nearest_stations(target, stops, k)

        return {"stops": response, "status": "OK"}

class Leapcard(Resource):

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        parser.add_argument('password', type=str)

        frontend_params = parser.parse_args()
        if frontend_params["username"] == None:
            return {"status": "NO_Username"}

        username = frontend_params['username']
        password = frontend_params['password']
        session = LeapSession()
        session.try_login("golfleap", "Monty1999")

        overview = session.get_card_overview()
        return overview


class realTime(Resource):
    def get(self):

        parser = reqparse.RequestParser()
        parser.add_argument('stopid', type=str)

        frontend_params = parser.parse_args()
        if frontend_params["stopid"] == None:
            return {"status": "NO_STOP"}

        stop_id = frontend_params['stopid']
        URL = 'https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation'
        req_items = {'stopid': stop_id}
        resp = requests.get(URL, params=req_items)
        parsed_json = (json.loads(resp.text))
        return parsed_json['results']


class routeInfo(Resource):
    """API endpoint for Dublin Bus Route Details. Returns all stops served by a route, grouped by direction and
    including the stop details ID, name, coordinates and all lines served. Takes a route as parameter. If no route
    is provided, a result with all routes previously cached, grouped by their names, is returned."""

    def get(self):
        global routes
        global stops_dict

        if stops_dict == None:
            build_stops_dict()

        parser = reqparse.RequestParser()
        parser.add_argument('routeid', type=str)

        frontend_params = parser.parse_args()

        # if no route is specified, return all routes
        if frontend_params["routeid"] == None:
            return routes
        route = frontend_params["routeid"].upper()

        # if route is cached, return cached result
        if route in routes:
            return routes[route]

        # if route is not cached yet, create the route_dict
        route_dict = {}
        # join stops and stops_route_match tables on stop_id and filter for the specified route only
        for stop, srm in db.session.query(StopsModel, SRModel).filter(cast(SRModel.stoppoint_id, String) == StopsModel.stop_id, SRModel.line_id == route).all():
            # create dictionary entry
            entry = {
                'stopid': stop.stop_id,
                'fullname': stop.name,
                'lat': stop.lat,
                'lng': stop.lon,
                'lines': stops_dict[stop.stop_id]
            }
            # if the direction is not in the route_dict yet, create direction and populate with array of entry
            if srm.direction not in route_dict:
                route_dict[srm.direction] = [entry]
            else:
                # else, append the entry to the existing array
                route_dict[srm.direction].append(entry)
        # add the route to the global variable
        routes[route] = route_dict
        return route_dict

class Directions(Resource):
    """API endpoint for transit directions from A to B in Dublin from Google's directions API.
    Expects the parameters "dep", "arr" (both required) and "time" (optional).
    Locations can be provided as address strings (spaces replaced by "+" in request) or coordinates in format "lat,lng".
    Response from Google API is processed for Frontend display."""

    def get(self):

        # parse request
        parser = reqparse.RequestParser()
        parser.add_argument('dep', type=str)
        parser.add_argument('arr', type=str)
        parser.add_argument('time', type=int)
        frontend_params = parser.parse_args()

        # check for required params
        if frontend_params["dep"] == None:
            return {"status": "NO_START"}
        elif frontend_params["arr"] == None:
            return {"status": "NO_DESTINATION"}

        # set params
        params = {
            "origin": frontend_params["dep"],
            "destination": frontend_params["arr"],
            "key": Config.GOOGLE_KEY,
            "mode": "transit",
            "departure_time": int(time.time()),
            "alternatives": "true"
        }
        # overwrite default value if time is specified
        if frontend_params["time"] != None:
            params["departure_time"] = frontend_params["time"]

        # make request-
        url = "https://maps.googleapis.com/maps/api/directions/json?"
        req = requests.get(url, params=params)
        res = req.json()

        # NEXT BLOCK ONLY FOR DEVELOPMENT PURPOSES
        # store results for debugging purposes
        now = str(int(datetime.datetime.now().timestamp()))
        with open('api/debugging/'+now+'.json', 'w') as outfile:
            json.dump(res, outfile, sort_keys=True, indent=8)

        # process response
        res = directions_parser(res, params["departure_time"])

        # NEXT BLOCK ONLY FOR DEVELOPMENT PURPOSES
        # store results for debugging purposes
        now = str(int(datetime.datetime.now().timestamp()))
        with open('api/debugging2/'+now+'.json', 'w') as outfile:
            json.dump(res, outfile, sort_keys=True, indent=8)
        
        if res["status"]!="OK":
            return res
    
        model_input=[]
        for connection in res["connections"]:
            model_input_row=[]
            db_index=connection["db_index"]
            for index in db_index:
                #retrieve a leg in the journey that represents a dublin bus ride
                route=connection["steps"][index]
                model_input_row.append(find_model(route))
            model_input.append(model_input_row)

        # NEXT BLOCK ONLY FOR DEVELOPMENT PURPOSES
        # store results for debugging purposes
        with open('api/debugging3/'+now+'.json', 'w') as outfile:
            json.dump(model_input, outfile, sort_keys=True, indent=8)

        for i in range(len(model_input)):
            connection=res["connections"][i]
            #if there is no dublin bus ride on the connection, move along to next connection
            if len(connection["db_index"])==0:
                continue
            # reset the start for the first bus to the time specified in the parameter plus however long it takes to get to the first bus stop
            prior_travel = 0  # time it takes to get to first bus
            for j in range(connection["db_index"][0]):
                prior_travel+=connection["steps"][j]["duration"]
            model_input[i][0]["start"]["time"]=params["departure_time"]+prior_travel

            for j in range(len(model_input[i])):
                leg=model_input[i][j]
                t_start=find_trip(leg["start"]["time"],leg["start"]["id"],leg["route"],leg["direction"])
                if len(t_start)==0:
                    print("Error: Couldn't find a bus with the following parameters:")
                    print(leg["start"]["time"], leg["start"]
                          ["id"], leg["route"], leg["direction"])
                    break
                index = 0
                midnight = datetime.datetime.fromtimestamp(leg["start"]["time"]).replace(
                    hour=0, minute=0, second=0, microsecond=0)
                # find the latest bus that doesn't depart prior to our set time
                while(True):
                    curr = t_start[index]
                    prediction = get_prediction(
                        curr["start_time"],int(midnight.timestamp())+curr["start_time"],curr["duration"], curr["route_id"], curr["direction"])
                    # TODO replace the time with what's specified in the request
                    if int(midnight.timestamp())+curr["start_time"]+prediction < leg["start"]["time"]:
                        break
                    index += 1
                    if index == len(t_start):
                        break
                start=t_start[max(0,index-1)]
                start["duration_p"]=prediction
                start["dep_p"]=start["start_time"]+prediction

                t_stop=match_trip(start["trip_id"],leg["stop"]["id"])
                prediction=get_prediction(start["start_time"],int(midnight.timestamp())+start["start_time"],t_stop["duration"],leg["route"],leg["direction"])
                t_stop["duration_p"]=prediction
                t_stop["dep_p"]=start["start_time"]+prediction
                
                #correct the values of the results of the directions parser
                bus_travel=connection["steps"][connection["db_index"][j]]
                bus_travel["duration"]=t_stop["duration_p"]-start["duration_p"]
                bus_travel["transit"]["arr"]["time"]=int(midnight.timestamp())+t_stop["dep_p"]
                bus_travel["transit"]["dep"]["time"]=int(midnight.timestamp())+start["dep_p"]
                bus_travel["transit"]["source"]="TFI HOOLIGANS"
                bus_travel["transit"]["arr"]["delta"]=t_stop["dep_p"]-t_stop["dep_time"]
                bus_travel["transit"]["dep"]["delta"]=start["dep_p"]-start["dep_time"]

                
                #modify start time if the current bus ride is the first on the connection
                if j==0:
                    connection["start"]["time"]=start["dep_p"]-prior_travel
                
                #check if there are more dublin bus journeys on this connection
                if j<len(model_input[i])-1:
                    #add the delta of predicted arrival and scheduled arrival to the start of the next bus journey
                    p_delta=t_stop["dep_p"]-t_stop["dep_time"]
                    model_input[i][j+1]["start"]["time"]+=p_delta
                    model_input[i][j+1]["stop"]["time"]+=p_delta
                #if the current is the last journey, modify the final time
                else:
                    later_travel = 0  # time it takes to get from final bus stop to destination
                    for k in range(connection["db_index"][j]+1, len(connection["steps"])):
                        later_travel += connection["steps"][k]["duration"]
                    connection["end"]["time"] = t_stop["dep_p"]+later_travel
                    connection["duration"] = connection["end"]["time"] - \
                        connection["start"]["time"]
        return res

def directions_parser(directions, time):
    """transforms response of Google's direction service into frontend-friendly format."""

    # check status of response
    status = directions["status"]
    if status != "OK":
        return directions

    routes = directions["routes"]

    # the response will be an array of routes
    connections = []

    # the available alternatives for getting from A to B are stored in the routes array
    for route in routes:
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
                "mode": step["travel_mode"],
                "html_instructions": step["html_instructions"]
            }

            # directions for walking are stored in array
            if curr_step["mode"] == "WALKING":
                polyline = []
                directions = []
                for segment in step["steps"]:
                    polyline.append(segment["polyline"]["points"])
                    instructions = None
                    if "html_instructions" in segment:
                        instructions = segment["html_instructions"]
                    directions.append(instructions)
                curr_step["polyline"] = polyline
                curr_step["directions"] = directions
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
                    "operator": step["transit_details"]["line"]["agencies"][0]["name"],
                    "source":"GOOGLE"
                }

                if transit["operator"] in ["Dublin Bus", "Go-Ahead"]:
                    if transit["operator"] == "Dublin Bus":
                        db_index.append(index)
                    transit["route"] = step["transit_details"]["line"]["short_name"]
                if transit["operator"] == "Luas":
                    transit["route"] = step["transit_details"]["line"]["name"]
                transit_index.append(index)
                polyline = []
                polyline.append(step["polyline"]["points"])
                curr_step["polyline"] = polyline
                curr_step["transit"] = transit

            steps.append(curr_step)
            index += 1

        curr["db_index"] = db_index
        curr["transit_index"] = transit_index
        curr["steps"] = steps

        curr["start"] = {
            "address": route["start_address"],
            "location": route['start_location']
        }
        curr["end"] = {
            "address": route["end_address"],
            "location": route["end_location"]
        }

        # arrival and departures times are taken from transit info if available and computed else.
        if len(curr["transit_index"]) >= 1:
            curr["start"]["time"] = route["departure_time"]["value"]
            curr["end"]["time"] = route["arrival_time"]["value"]
        else:
            curr["start"]["time"] = time
            total_duration = 0
            for step in curr["steps"]:
                total_duration += step["duration"]
            curr["end"]["time"] = time+total_duration
        connections.append(curr)

    return {"connections": connections, "status": status}

def build_tree():
    """build KDTree to search through stops with log(n) time complexity.
    For this, the global variables stops, coords tree, and stops_dict are populated"""
    global stops
    global coords
    global tree
    global stops_dict

    if stops_dict == None:
        build_stops_dict()

    stops = []
    coords = np.empty([0, 2])
    for stop in StopsModel.query.all():
        stops.append({
            'stopid': stop.stop_id,
            'fullname': stop.name,
            'lat': stop.lat,
            'lng': stop.lon,
            'lines': stops_dict[stop.stop_id]
        })
        coords = np.append(coords, [[stop.lat, stop.lon]], axis=0)
    tree = KDTree(coords)

def nearest_stations(target, stops, k):
    global tree
    # calculate the nearest neighbours
    if tree == None:
        build_tree()
        # print("KD-Tree is built.")
    nearest_dist, nearest_ind = tree.query(target, k=k)

    # populate response with rows from stops specified by calculated indices
    response = []
    for ind in nearest_ind[0]:
        response.append(stops[ind])
    return response

def find_model(route):
    """matches a dublin bus journey as returned by the google direction API with a route ID, stop IDs for origin
    and destination, and a direction as stored in the DB."""
        
    global stops
    global tree
    global models

    def route_matcher(stations,route):
        """matches route from google directions with closest stations from search.
        requires that stops response includes route info."""
        response=[]
        index=0
        for station in stations:
            if route in station["lines"]:
                response.append(index)
            index+=1
        return response

    def route_verifier(start_stations, stop_stations, start_index, stop_index, route):
        """function that checks whether start_stations and stop_stations can be connected by the route represented
        in the google direction."""
        for start in start_index:
            start_info=start_stations[start]["lines"][route]
            for stop in stop_index:
                stop_info=stop_stations[stop]["lines"][route]
                #print(f"Trying to match route {route}:{start_info} with {route}:{stop_info}.")
                for direction in start_info:
                    if direction in stop_info:
                        if start_info[direction]<stop_info[direction]:
                            return {
                                "route":route,
                                "direction":direction,
                                "start":{
                                    "id":start_stations[start]["stopid"]
                                },
                                "stop":{
                                    "id":stop_stations[stop]["stopid"]
                                }
                            }    

    if stops==None:
        build_tree()
        # print("KD-Tree is built.")

    #set the coordinates of the starting and destination stop as suggested by google
    google_start=[[route["start"]["lat"],route["start"]["lng"]]]
    google_stop=[[route["stop"]["lat"],route["stop"]["lng"]]]
    #retrieve the route information as suggested by google
    google_route=route["transit"]["route"].upper()
    #retrieve the closest bus stops in our data to start and stop
    start_stations=nearest_stations(google_start,stops,30)
    stop_stations=nearest_stations(google_stop,stops,30)
    #check which stations in the closest stops match up with google route
    start_index=route_matcher(start_stations,google_route)
    stop_index=route_matcher(stop_stations,google_route)
    #print(f"Detected options in start are {start_index}.")
    #print(f"Detected options in start are {stop_index}.")
    #find a connection of the google route between two stops in the station data
    response=route_verifier(start_stations,stop_stations,start_index,stop_index,google_route)
    if response!=None:
        response["start"]["time"]=route["transit"]["dep"]["time"]
        response["stop"]["time"]=route["transit"]["arr"]["time"]
    return response

def find_trip(time, stop_id, route_id, direction):
    """finds trips according to specified parameters that were supposed to depart within the last 120 mins of timestamp according to schedule."""
    time = datetime.datetime.fromtimestamp(time)
    weekday = time.weekday()
    if weekday < 5:
        service_id = "y1002"
    elif weekday == 5:
        service_id = "y1001"
    else:
        service_id = "y1003"
    midnight = time.replace(hour=0, minute=0, second=0, microsecond=0)
    timestamp=time-midnight
    result=db.session.query(GTFS_times,GTFS_trips).filter((GTFS_times.stop_id==stop_id) & (GTFS_times.dep<=(timestamp.seconds+20*60)) & (GTFS_times.dep>=(timestamp.seconds-1*60*60))).join(GTFS_trips, (GTFS_times.trip_id==GTFS_trips.trip_id) & (GTFS_trips.route_id==route_id) & (GTFS_trips.direction==direction) & (GTFS_trips.service_id==service_id)).order_by(GTFS_times.dep.desc())
    response=[]
    for times,trips in result:
        response.append({
            "trip_id": times.trip_id,
            "stop_id": times.stop_id,
            "start_time": times.start,
            "dep_time": times.dep,
            "duration": times.cum_dur,
            "route_id": trips.route_id,
            "direction": trips.direction
        })
    return response

def match_trip(trip_id, stop_id):
    "returns the row from trips table that matches the trip and stop"
    result = db.session.query(GTFS_times).filter(
        (GTFS_times.trip_id == trip_id) & (GTFS_times.stop_id == stop_id)).first()
    return {
        "trip_id": result.trip_id,
        "progr_number": result.progr_number,
        "stop_id": result.stop_id,
        "start": result.start,
        "dep_time": result.dep,
        "duration": result.cum_dur
    }

def get_prediction(timestamp, datetimestamp, duration, route_id, direction):
    global features
    global models
    global holidays_IE

    if features == None:
        load_features()
        # print("Features are loaded.")

    # load model
    model_name = route_id+"_"+str(direction)
    if model_name not in models:
        load_model(model_name)
        # print(f"Model for route {route_id}, direction {direction} loaded.")
    model=models[model_name]

    #retrieve feature sets for line and direction
    feature_set=features[str(route_id)][str(direction)]
            
    #retrieve time input
    dt=datetime.datetime.fromtimestamp(timestamp)
    wd,m,h=dt.weekday(),dt.month,dt.hour
    if datetime.datetime.fromtimestamp(datetimestamp) in holidays_IE:
        holiday=1
    else:
        holiday=0

    #retrieve weather input
    humidity,weather=get_weather(datetimestamp)
            
    #transform input for actual duration prediction
    model_input=model_input_create(humidity,duration,weather,wd,m,h,holiday,feature_set)
            
    #predict the actual duration of the trip
    input_df=pd.DataFrame(model_input).T
    input_df.columns=feature_set
    prediction=model.predict(input_df)
    return round(prediction[0])       

def load_features():
    """function loads global variable features, which holds the feature sets for each model, from json file."""
    global features

    with open('features.json') as json_file:
        features = json.load(json_file)

def load_model(model_name):
    """loads model with specified name into global variable models"""
    global models
    
    with open("preds/"+model_name+".sav", 'rb') as pickle_file:
        models[model_name]=pickle.load(pickle_file)

def build_stops_dict():
    global stops_dict
    stops_dict = {}
    for stop in SRModel.query.all():
        if str(stop.stoppoint_id) not in stops_dict:
            stops_dict[str(stop.stoppoint_id)] = {
                stop.line_id: {
                    stop.direction: stop.progr_number
                }
            }
        elif stop.line_id not in stops_dict[str(stop.stoppoint_id)]:
            stops_dict[str(stop.stoppoint_id)][stop.line_id] = {
                stop.direction: stop.progr_number
            }
        elif stop.direction not in stops_dict[str(stop.stoppoint_id)][stop.line_id]:
            stops_dict[str(stop.stoppoint_id)
                       ][stop.line_id][stop.direction] = stop.progr_number

def get_weather(timestamp):
    """retrieves weather by checking timestamp and either returning cached value, calling update script or do TO DO behavior
    from global variables weather and forecast."""
    global weather
    global forecast

    def update_weather():
        """sends request for current weather to open weather map API for dublin, ireland and stores the response in global variable weather."""     
        global weather
        url="https://api.openweathermap.org/data/2.5/weather"
        params={
            "q":"dublin,leinster,ireland",
            "appid":Config.OWM_KEY,
            "units":"metric"
        }
        weather_res=requests.get(url=url,params=params)
        weather=weather_res.json()

    def update_forecast():
        """sends request for 48 hour hourly weather forecast to open weather map API for coordinates of dublin and stores response in global dict forecast."""
        global forecast
        url="https://api.openweathermap.org/data/2.5/onecall"
        params={
            "lat":53.3498, #lat of dublin
            "lon":-6.2603, #lon of dublin
            "exclude":"current,minutely,daily", #exclude unnecessary forecast components
            "appid":Config.OWM_KEY,
            "units":"metric"
        }
        #make request and store response in global variable
        forecast_res=requests.get(url=url,params=params)
        forecast=forecast_res.json()["hourly"]

    now=round(datetime.datetime.now().timestamp())
    #if the timestamp for the prediction is within 30 mins, get the prediction for now
    if abs(timestamp-now)<=(30*60):
        #update the weather if the cached value is older than 15 mins.
        if weather==None or abs(now-weather["dt"])>=(15*60):
            update_weather()
            # print("Weather is loaded/updated.")
        #return tuple of (humidity,weather description)
        return weather["main"]["humidity"],weather["weather"][0]["description"]

    #if the timestamp for the prediction is within 48 hours of the current hour, use OWM forecast
    hour_delta=round(timestamp//3600)-now//3600 #calculate the difference of hour stamps
    if 0<=hour_delta<48:
        if forecast != None: #check whether forecast has been cached before
            #calculate difference in hourstamps between first cached forecast value and provided timestamp
            hours_away=round(timestamp//3600)-int(forecast[0]["dt"]/3600)
            #check whether timestamp value is covered by cached forecast
            if 0<=hours_away<48:
                fc_row=forecast[hours_away]
                #return tuple of (humidity,weather description)
                return fc_row["humidity"],fc_row["weather"][0]["description"]
        #update forecast if no cache exists or timestamp value is not covered but latest cached forecast.
        update_forecast()
        fc_row=forecast[hour_delta]
        #return tuple of (humidity,weather description)
        return fc_row["humidity"],fc_row["weather"][0]["description"]
    #TO DO: weather handling if it isn't near current time or within 48 hour forecast window
    else:
        # return mode of weather description and mean of humidity of historical weather data in the same month and same time of day
        dt=datetime.datetime.fromtimestamp(timestamp)
        weather_descriptions=[]
        humidities=[]
        #query weather data for month and hour of timestamp
        for row in Weather.query.filter(Weather.month==dt.month,Weather.hour==dt.hour).all():
            weather_descriptions.append(row.weather_description)
            humidities.append(row.humidity)
        return round(mean(humidities)),mode(weather_descriptions)

def model_input_create(humidity,dur_s,weather_description,weekday,month,hour,holiday,feature_set):
    """transforms input data to array suitable for modelling."""
    response=[0]*len(feature_set) #create response array
    #add weather description feature
    weather_string="weather_description_"+weather_description
    if weather_string in feature_set:
        response[feature_set.index(weather_string)]=1
    #add weekday feature
    weekday_string="weekday_"+str(weekday)
    if weekday_string in feature_set:
        response[feature_set.index(weekday_string)]=1
    #add month feature
    month_string="month_"+str(month)
    if month_string in feature_set:
        response[feature_set.index(month_string)]=1
    #add hour feature
    hour_string="hour_"+str(hour)
    if hour_string in feature_set:
        response[feature_set.index(hour_string)]=1
    #add holiday feature
    holiday_string="holiday_"+str(holiday)
    if holiday_string in feature_set:
        response[feature_set.index(holiday_string)]=1
    #add the timetable duration
    response[feature_set.index("dur_s")]=dur_s
    #add the humidity
    response[feature_set.index("humidity")]=humidity
    return response   

api.add_resource(Directions, '/api/directions', endpoint='direction')
api.add_resource(NearestNeighbor, '/api/nearestneighbor', endpoint='nearestneighbor')
api.add_resource(realTime, '/api/realtime', endpoint='realtime')
api.add_resource(routeInfo, '/api/routeinfo', endpoint='routeinfo')
api.add_resource(Stops, '/api/stops', endpoint='stops')
api.add_resource(Leapcard, '/api/leapcard', endpoint='leapcard')

api.add_resource(Test, '/test', endpoint='test')
api.add_resource(TestWeather, '/testweather', endpoint='testweather')


