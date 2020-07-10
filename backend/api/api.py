import json, os, requests, datetime
from flask_restful import Resource, Api, reqparse

from .models import Stops as StopsModel

api = Api()

class Stops(Resource):
    """API endpoint for Dublin Bus stop information. Returns a JSON containing all stops."""
    def get(self):
        stops=[]
        for stop in StopsModel.query.all():
            stops.append({'id': stop.stop_id, 'name':stop.name, 'coords':{'lat':stop.lat,'lon':stop.lon}})
        return stops

class realTime(Resource):
    def get(self):

        parser = reqparse.RequestParser()
        parser.add_argument('stopid', type=str)

        frontend_params=parser.parse_args()
        if "stopid" not in frontend_params:
            return {"status":"NO_STOP"}

        stop_id = frontend_params['stopid']
        URL = 'https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation'
        req_items = {'stopid': stop_id}  
        resp = requests.get(URL, params=req_items)
        parsed_json = (json.loads(resp.text))
        return parsed_json['results']


class Directions(Resource):
    """API endpoint for transit directions from A to B in Dublin from Google's directions API.
    Expects the parameters "dep", "arr" (both required) and "time" (optional).
    Locations can be provided as address strings (spaces replaced by "+" in request) or coordinates in format "lat,lng".
    Response from Google API is processed for Frontend display."""
    def get(self):

        #parse request
        parser = reqparse.RequestParser()
        parser.add_argument('dep', type=str)
        parser.add_argument('arr', type=str)
        parser.add_argument('time',type=int)
        frontend_params=parser.parse_args()

        #check for required params
        if "dep" not in frontend_params:
            return {"status":"NO_START"}
        elif "arr" not in frontend_params:
            return {"status":"NO_DESTINATION"}
        
        #set params
        params={
            "origin":frontend_params["dep"],
            "destination":frontend_params["arr"],
            "key":os.environ.get('GOOGLE_KEY'),
            "mode":"transit",
            "departure_time":"now",
            "alternatives":"true"
        }
        if "time" in frontend_params: #overwrite default value if time is specified
            params["departure_time"]=frontend_params["time"]

        #make request-
        url="https://maps.googleapis.com/maps/api/directions/json?"
        req = requests.get(url, params=params)
        res = req.json()

        #NEXT BLOCK ONLY FOR DEVELOPMENT PURPOSES
        #store results for debugging purposes
        now=str(int(datetime.datetime.now().timestamp()))
        with open('api/debugging/'+now+'.json', 'w') as outfile:
            json.dump(res, outfile, sort_keys=True, indent=8)

        #process response
        res=directions_parser(res)

        return res        
        

def directions_parser(directions):
    """transforms response of Google's direction service into frontend-friendly format."""
    
    #check status of response
    status=directions["status"]
    if status!="OK":
        return directions

    routes=directions["routes"]

    #the response will be an array of routes
    connections=[]

    #the available alternatives for getting from A to B are stored in the routes array
    for route in routes:
        #as there are not waypoints specified, there is always going to be exactly one leg in the response:
        route=route["legs"][0]
        
        #route specific information is stored in variable curr
        curr={
            "distance":route["distance"]["value"],
            "duration":route["duration"]["value"]
        }
        
        db_index=[] #holds index of dublin bus travel(s) in leg array
        bus_index=[] #holds index of all bus travel(s) in leg array
        steps=[]
        index=0

        #the required steps to get from A to B in each alternative are stored in the legs array
        for step in route["steps"]:
            
            #step specific information is stored in variable curr_step.
            #the information pertinent to all steps will be accessible from the routes in the steps array.
            curr_step={
                "distance":step["distance"]["value"],
                "duration":step["duration"]["value"],
                "start":step["start_location"],
                "stop":step["end_location"],
                "mode":step["travel_mode"]
            }
            
            #directions for walking are stored in array of polylines
            if curr_step["mode"]=="WALKING":
                polylines=[]
                for poly_elem in step["steps"]:
                    polylines.append(poly_elem["polyline"]["points"])
                curr_step["polyline"]=polylines
            #transic specific information is stored in variable transit, which will be addedd to curr_step
            if curr_step["mode"]=="TRANSIT":
                transit={
                    "dep":{
                        "name":step["transit_details"]["departure_stop"]["name"],
                        "time":step["transit_details"]["departure_time"]["value"]
                    },
                    "arr":{
                        "name":step["transit_details"]["arrival_stop"]["name"],
                        "time":step["transit_details"]["arrival_time"]["value"]
                    },
                    "headsign":step["transit_details"]["headsign"],
                    "type":step["transit_details"]["line"]["agencies"][0]["name"]
                }

                if transit["type"] in ["Dublin Bus","Go-Ahead"]:
                    if transit["type"]=="Dublin Bus":
                        db_index.append(index)
                    transit["route"]=step["transit_details"]["line"]["short_name"]
                if step["transit_details"]["line"]["vehicle"]["type"]=="BUS":
                    bus_index.append(index)
                curr_step["transit"]=transit
                curr_step["polyline"]=step["polyline"]["points"]
            
            steps.append(curr_step)
            index+=1

        curr["db_index"]=db_index
        curr["bus_index"]=bus_index
        curr["steps"]=steps

        #times are only specified if transit is involved
        if len(curr["bus_index"])>=1:
            curr["start"]={
                "time":route["departure_time"]["value"],
                "address":route["start_address"],
                "location":route['start_location']
            }
            curr["end"]={
                "time":route["arrival_time"]["value"],
                "address":route["end_address"],
                "location":route["end_location"]
            }

        connections.append(curr)
    
    return {"connections": connections, "status": status}

api.add_resource(Directions, '/directions', endpoint='direction')
api.add_resource(Stops, '/stops', endpoint='stops')
api.add_resource(realTime, '/realtime', endpoint='realtime')