import json, os, requests, datetime, numpy as np, time, pickle
from sklearn.neighbors import KDTree
from flask_restful import Resource, Api, reqparse
from sqlalchemy.types import String
from sqlalchemy import cast

from .models import Stops as StopsModel, StopsRoute as SRModel, db

api = Api()

stops = None
coords = None
tree = None
stops_dict = None
models = None
features = None
weather = None
forecast = None
routes = {}

class Stops(Resource):
    """API Endpoint for Dublin Bus stop information. Returns all stops that contain specified substring in either
    ID or name."""

    def get(self):
        global stops_dict

        if stops_dict==None:
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
        print(looking_for)
        for count, row in enumerate(StopsModel.query.filter(StopsModel.stop_id.ilike(looking_for)).all()[:3]):
            response.append({
                'stop_id': row.stop_id,
                'fullname': row.name,
                'lat': row.lat,
                'lng': row.lon,
                'key': count + row.lat-row.lon,
                'lines':stops_dict[row.stop_id]
                })
        for count, row in enumerate(StopsModel.query.filter(StopsModel.name.ilike(looking_for)).all()[:3]):
            response.append({
                'stop_id': row.stop_id,
                'fullname': row.name,
                'lat': row.lat,
                'lng': row.lon,
                'key': count + row.lat-row.lon,
                'lines':stops_dict[row.stop_id]
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

        if stops==None:
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

        response=nearest_stations(target,stops,k)

        return {"stops": response, "status": "OK"}


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

        if stops_dict==None:
            build_stops_dict()
            
        parser = reqparse.RequestParser()
        parser.add_argument('routeid', type=str)

        frontend_params = parser.parse_args()

        #if no route is specified, return all routes
        if frontend_params["routeid"]==None:
            return routes
        route=frontend_params["routeid"].upper()

        #if route is cached, return cached result
        if route in routes:
            return routes[route]
        
        #if route is not cached yet, create the route_dict
        route_dict={}
        #join stops and stops_route_match tables on stop_id and filter for the specified route only
        for stop, srm in db.session.query(StopsModel, SRModel).filter(cast(SRModel.stoppoint_id,String) == StopsModel.stop_id,SRModel.line_id == route).all():
            #create dictionary entry
            entry={
                'stopid': stop.stop_id,
                'fullname': stop.name,
                'lat': stop.lat,
                'lng': stop.lon,
                'lines':list(stops_dict[stop.stop_id].keys())
            }
            #if the direction is not in the route_dict yet, create direction and populate with array of entry
            if srm.direction not in route_dict:
                route_dict[srm.direction]=[entry]
            else:
                #else, append the entry to the existing array
                route_dict[srm.direction].append(entry)
        #add the route to the global variable
        routes[route]=route_dict
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
            "key": os.environ.get('GOOGLE_KEY'),
            "mode": "transit",
            "departure_time": int(time.time()),
            "alternatives": "true"
        }
        if frontend_params["time"] != None:  # overwrite default value if time is specified
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
        
        model_info=find_model(res)

        # NEXT BLOCK ONLY FOR DEVELOPMENT PURPOSES
        # store results for debugging purposes        
        with open('api/debugging3/'+now+'.json', 'w') as outfile:
            json.dump(model_info, outfile, sort_keys=True, indent=8)

        prediction=get_prediction(model_info)

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
                "html_instructions":step["html_instructions"]
            }

            # directions for walking are stored in array
            if curr_step["mode"] == "WALKING":
                polyline = []
                directions=[]
                for segment in step["steps"]:
                    polyline.append(segment["polyline"]["points"])
                    instructions=None
                    if "html_instructions" in segment:
                        instructions=segment["html_instructions"]
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
                    "operator": step["transit_details"]["line"]["agencies"][0]["name"]
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

    if stops_dict==None:
        build_stops_dict()

    stops=[]
    coords=np.empty([0, 2])
    for stop in StopsModel.query.all():
        stops.append({
            'stopid': stop.stop_id,
            'fullname': stop.name,
            'lat': stop.lat,
            'lng': stop.lon,
            'lines':stops_dict[stop.stop_id]
            })
        coords = np.append(coords, [[stop.lat, stop.lon]], axis=0)
    tree=KDTree(coords)

def nearest_stations(target, stops, k):
    global tree
    # calculate the nearest neighbours
    if tree==None:
        build_tree()
        print("KD-Tree is built.")
    nearest_dist, nearest_ind = tree.query(target, k=k)

    # populate response with rows from stops specified by calculated indices
    response = []
    for ind in nearest_ind[0]:
        response.append(stops[ind])
    return response

def find_model(directions):
    global stops
    global tree
    global models

    if stops==None:
        build_tree()
        print("KD-Tree is built.")

    if models==None:
        load_models()
        print("Models are loaded.")

    if directions["status"]!="OK":
        return directions
    
    model_data=[]
    for connection in directions["connections"]:
        model_data_row=[]
        db_index=connection["db_index"]
        for index in db_index:
            route=connection["steps"][index]
            google_start=[[route["start"]["lat"],route["start"]["lng"]]]
            google_stop=[[route["stop"]["lat"],route["stop"]["lng"]]]
            google_route=route["transit"]["route"].upper()
            start_stations=nearest_stations(google_start,stops,30)
            stop_stations=nearest_stations(google_stop,stops,30)
            start_index=route_matcher(start_stations,google_route)
            stop_index=route_matcher(stop_stations,google_route)
            print(f"Detected options in start are {start_index}.")
            print(f"Detected options in start are {stop_index}.")
            response=model_finder(start_stations,stop_stations,start_index,stop_index,google_route)
            if response!=None:
                response["start"]["time"]=route["transit"]["dep"]["time"]
                response["stop"]["time"]=route["transit"]["arr"]["time"]
                print(response)
            model_data_row.append(response)
        model_data.append(model_data_row)
    return model_data

def get_prediction(model_info):
    global features

    if features==None:
        load_features()
        print("Features loaded.")

    predictions=[]
    for route in model_info:
        predictions_row=[]
        for leg in route:
            print(f"Retrieving prediction for route {leg['route']}, direction {leg['direction']}.")

            #load pickle files
            model_name=leg["route"]+"_"+str(leg["direction"])+".sav"
            sched=pickle.load( open( "schedule_preds/"+model_name, "rb" ))
            actual=pickle.load(open("duration_preds/"+model_name, "rb"))

            #retrieve feature sets for line and direction
            feature_set=features[str(leg["route"])][str(leg["direction"])]
            
            #retrieve time input
            dt_start=datetime.datetime.fromtimestamp(leg["start"]["time"])
            dt_stop=datetime.datetime.fromtimestamp(leg["stop"]["time"])
            wd_start,m_start,h_start=dt_start.weekday(),dt_start.month,dt_start.hour
            wd_stop,m_stop,h_stop=dt_stop.weekday(),dt_stop.month,dt_stop.hour
            
            #transform input for schedule prediction
            sched_input_start=sched_input_create(wd_start,m_start,h_start,int(leg["start"]["id"]),feature_set["schedule"])
            sched_input_stop=sched_input_create(wd_stop,m_stop,h_stop,int(leg["stop"]["id"]),feature_set["schedule"])
            
            #predict the scheduled duration of the trip
            sched_start,sched_stop=sched.predict([sched_input_start,sched_input_stop])
            print(f"Prediction for trip duration (scheduled): {(sched_stop-sched_start)/60:.2f} mins.")
            
            #retrieve weather input
            temp,weather=get_weather(leg["start"]["time"])
            
            #transform input for actual duration prediction
            dur_input_start=dur_input_create(temp,sched_start,weather,wd_start,m_start,h_start,feature_set["actual"])
            dur_input_stop=dur_input_create(temp,sched_stop,weather,wd_stop,m_stop,h_stop,feature_set["actual"])   
            
            #predict the actual duration of the trip
            dur_start,dur_stop=actual.predict([dur_input_start,dur_input_stop])
            print(f"Prediction for trip duration (actual): {(dur_stop-dur_start)/60:.2f} mins.")
            print("")
            predictions_row.append({
                "schedule":round(sched_stop-sched_start),
                "duration":round(dur_stop-dur_start)
                })
        predictions.append(predictions_row)
    return predictions               

def load_features():
    """function loads global variable features, which holds the feature sets for each model, from json file."""
    global features

    with open('features.json') as json_file:
        features = json.load(json_file)

def load_models():
    """loads models into global variable models"""
    global models
    models={
        "schedule":{},
        "duration":{}
    }
    for model in SRModel.query.distinct(SRModel.line_id,SRModel.direction):
        model_name=str(model.line_id)+"_"+str(model.direction)+".sav"
        p_schedule = open("schedule_preds/"+model_name, 'rb')
        p_duration = open("duration_preds/"+model_name, 'rb')
        if  str(model.line_id) not in models["schedule"]:
            models["schedule"][str(model.line_id)]={
                    model.direction:pickle.load(p_schedule)
            }
            models["duration"][str(model.line_id)]={
                    model.direction:pickle.load(p_duration)
            }
        else:
            models["schedule"][str(model.line_id)][model.direction]=pickle.load(p_schedule)
            models["duration"][str(model.line_id)][model.direction]=pickle.load(p_duration)

def route_matcher(stations,route):
    """implement logic to match route from google directions with closest stations from search.
    requires that stops response includes route info."""
    global stops_dict

    if stops_dict==None:
        build_stops_dict()

    response=[]
    index=0
    for station in stations:
        if route in station["lines"]:
            response.append(index)
        index+=1
    return response

def model_finder(start_stations, stop_stations, start_index, stop_index, route):
    for start in start_index:
        start_info=start_stations[start]["lines"][route]
        for stop in stop_index:
            stop_info=stop_stations[stop]["lines"][route]
            print(f"Trying to match route {route}:{start_info} with {route}:{stop_info}.")
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

def build_stops_dict():
    global stops_dict
    stops_dict={}
    for stop in SRModel.query.all():
        if str(stop.stoppoint_id) not in stops_dict:
            stops_dict[str(stop.stoppoint_id)]={
                stop.line_id:{
                    stop.direction:stop.progr_number
                }
            }
        elif stop.line_id not in stops_dict[str(stop.stoppoint_id)]:
            stops_dict[str(stop.stoppoint_id)][stop.line_id]={
                stop.direction:stop.progr_number
            }
        elif stop.direction not in stops_dict[str(stop.stoppoint_id)][stop.line_id]:
            stops_dict[str(stop.stoppoint_id)][stop.line_id][stop.direction]=stop.progr_number

def get_weather(timestamp):
    """retrieves weather by checking timestamp and either returning cached value, calling update script or do TO DO behavior
    from global variables weather and forecast."""
    global weather
    global forecast
    now=round(datetime.datetime.now().timestamp())
    
    #if the timestamp for the prediction is within 30 mins, get the prediction for now
    if abs(timestamp-now)<=(30*60):
        #update the weather if the cached value is older than 15 mins.
        if weather==None or abs(now-weather["dt"])>=(15*60):
            update_weather()
            print("Weather is loaded/updated.")
        #return tuple of (temperature,weather description)
        return weather["main"]["temp"],weather["weather"][0]["main"]

    #if the timestamp for the prediction is within 48 hours of the current hour, use OWM forecast
    hour_delta=round(timestamp//3600)-now//3600 #calculate the difference of hour stamps
    if 0<=hour_delta<48:
        if forecast != None: #check whether forecast has been cached before
            #calculate difference in hourstamps between first cached forecast value and provided timestamp
            hours_away=round(timestamp//3600)-int(forecast[0]["dt"]/3600)
            #check whether timestamp value is covered by cached forecast
            if 0<=hours_away<48:
                fc_row=forecast[hours_away]
                #return tuple of (temperature,weather description)
                return fc_row["temp"],fc_row["weather"][0]["main"]
        #update forecast if no cache exists or timestamp value is not covered but latest cached forecast.
        update_forecast()
        print("Forecast is loaded.")
        fc_row=forecast[hour_delta]
        #return tuple of (temperature,weather description)
        return fc_row["temp"],fc_row["weather"][0]["main"]
    #TO DO: weather handling if it isn't near current time or within 48 hour forecast window
    else:
        #for now, we just return the current weather (suboptimal)
        if abs(now-weather["dt"])>=(15*60):
            update_weather()
        #return tuple of (temperature,weather description)
        return weather["main"]["temp"],weather["weather"][0]["main"]

def update_weather():
    """sends request for current weather to open weather map API for dublin, ireland and stores the response in global variable weather."""
    global weather
    
    url="https://api.openweathermap.org/data/2.5/weather"
    params={
        "q":"dublin,leinster,ireland",
        "appid":os.environ.get("OWM_KEY"),
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
        "appid":os.environ.get("OWM_KEY"),
        "units":"metric"
    }

    #make request and store response in global variable
    forecast_res=requests.get(url=url,params=params)
    forecast=forecast_res.json()["hourly"]
        
def sched_input_create(weekday,month,hour,stop,feature_set):
    """Transforms necessary data for schedule predictor in appropriate format for model."""
    wd_input=ordinal_match(weekday,feature_set["weekday"])        
    month_input=ordinal_match(month,feature_set["month"])
    hour_input=ordinal_match(hour,feature_set["hour"])
    stop_input=ordinal_match(stop,feature_set["stops"])       
    return wd_input+month_input+hour_input+stop_input

def dur_input_create(temp,dur_s,weather,weekday,month,hour,feature_set):
    """Transforms necessary data for duration predictor in appropriate format for model."""
    weather_input=ordinal_match(weather,feature_set["weather"])
    wd_input=wd_input=ordinal_match(weekday,feature_set["weekday"])
    month_input=ordinal_match(month,feature_set["month"])
    hour_input=ordinal_match(hour,feature_set["hour"])
    return [temp,dur_s]+weather_input+wd_input+month_input+hour_input

def ordinal_match(value,cardinality):
    """Transforms ordinal feature in format suitable for modelling by retrieving the
    cardinality of the binary encoded feature of the model and then
    setting the correct column "one-hot"."""
    response=[0]*len(cardinality)
    try:
        response[cardinality.index(value)]=1
    except:
        print(f"Could not match {str(value)}.")
    return response    

api.add_resource(Directions, '/directions', endpoint='direction')
api.add_resource(NearestNeighbor, '/nearestneighbor',
                 endpoint='nearestneighbor')
api.add_resource(realTime, '/realtime', endpoint='realtime')
api.add_resource(routeInfo, '/routeinfo', endpoint='routeinfo')
api.add_resource(Stops, '/stops', endpoint='stops')
